import type { MCPClient } from "@ai-sdk/mcp";
import { createMCPClient } from "@ai-sdk/mcp";
import { tool } from "ai";
import { z } from "zod";
import { mcpServers } from "./config";

export type InterviewHrQuestionsMcpResult = {
  tools: Awaited<ReturnType<MCPClient["tools"]>>;
  close: () => Promise<void>;
};

/**
 * 获取 interview-hr-questions MCP server 的工具
 * 用于模拟面试场景中获取 HR 行为面试题
 */
export async function getInterviewHrQuestionsMcpTools(): Promise<InterviewHrQuestionsMcpResult> {
  const config = mcpServers["interview-hr-questions"];
  const client = await createMCPClient({
    transport: {
      type: "http",
      url: config.url,
      headers: config.headers,
    },
    name: "interview-hr-questions",
  });

  const tools = await client.tools();

  return {
    tools,
    close: () => client.close(),
  };
}

const MCP_TOOL_TIMEOUT_MS = 30_000;

/**
 * 将 MCP CallToolResult 转为模型可用的字符串格式
 */
function mcpResultToText(result: unknown): string {
  if (result === null || result === undefined) return "";
  if (typeof result === "string") return result;
  if (
    typeof result === "object" &&
    "content" in result &&
    Array.isArray((result as { content: unknown[] }).content)
  ) {
    const content = (result as { content: Array<{ type?: string; text?: string }> }).content;
    return content
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text)
      .join("\n\n");
  }
  if (typeof result === "object" && "toolResult" in result) {
    return JSON.stringify((result as { toolResult: unknown }).toolResult, null, 2);
  }
  return JSON.stringify(result, null, 2);
}

/**
 * 创建「每次执行时新建连接」的 get_hr_behavioural_interview 工具
 * 解决 MCP HTTP 传输在模型生成后连接超时导致执行失败的问题
 */
export function createGetHrBehaviouralInterviewTool() {
  const config = mcpServers["interview-hr-questions"];

  return tool({
    description:
      "获取前端面试派网站的 HR 行为面试题和答案。内容包括：个人介绍、离职原因、空窗期、职业规划、优缺点、冲突处理、STAR 模型等面试技巧。",
    inputSchema: z.object({}),
    execute: async (_input: Record<string, never>) => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`MCP 工具执行超时（${MCP_TOOL_TIMEOUT_MS / 1000}秒）`)),
          MCP_TOOL_TIMEOUT_MS
        );
      });

      const executePromise = (async () => {
        const client = await createMCPClient({
          transport: {
            type: "http",
            url: config.url,
            headers: config.headers,
          },
          name: "interview-hr-questions",
        });

        try {
          const tools = await client.tools();
          const hrTool = tools.get_hr_behavioural_interview;
          if (!hrTool) {
            throw new Error("MCP server 未提供 get_hr_behavioural_interview 工具");
          }
          const result = await hrTool.execute(
            {},
            {} as Parameters<typeof hrTool.execute>[1]
          );
          return mcpResultToText(result);
        } finally {
          await client.close();
        }
      })();

      return Promise.race([executePromise, timeoutPromise]);
    },
  });
}
