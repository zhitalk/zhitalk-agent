import { generateObject, convertToModelMessages } from "ai";
import { z } from "zod";
import type { ChatMessage } from "@/lib/types";
import { myProvider } from "@/lib/ai/providers";

const classifySchema = z.object({
  resume_opt: z
    .boolean()
    .describe("用户是否在询问简历优化相关的问题"),
  mock_interview: z
    .boolean()
    .describe("用户是否在询问模拟面试相关的问题"),
  related_topics: z
    .boolean()
    .describe("用户是否在询问和编程、面试、简历相关的话题"),
  others: z
    .boolean()
    .describe("用户是否在询问其他话题（不在上述范围内）"),
});

export type ClassifyResult = z.infer<typeof classifySchema>;

const classifySystemPrompt = `你叫“智语”，是一个互联网大公司的资深程序员和面试官，尤其擅长前端技术栈，包括 HTML、CSS、JavaScript、TypeScript、React、Vue、Node.js、小程序等技术。

请根据用户输入的内容，判断用户属于哪一种情况？按说明输出 JSON 格式。

输出规则：
- resume_opt: 用户询问简历优化相关的问题
- mock_interview: 用户询问模拟面试相关的问题
- related_topics: 用户询问和编程、面试、简历相关的话题
- others: 其他话题（不在上述范围内）

注意：每个字段都是布尔值，请根据用户输入准确判断。`;

/**
 * AI SDK workflow 节点：分类用户消息
 * 输入 messages，输出结构化数据，判断用户属于哪种情况
 *
 * @param messages - 用户消息列表
 * @returns 分类结果，包含 resume_opt、mock_interview、related_topics、others 四个布尔字段
 */
export async function classifyMessages(
  messages: ChatMessage[]
): Promise<ClassifyResult> {
  const result = await generateObject({
    model: myProvider.languageModel("chat-model"),
    system: classifySystemPrompt,
    messages: convertToModelMessages(messages),
    schema: classifySchema,
  });

  return result.object;
}

