import { createUIMessageStream } from "ai";
import type { Session } from "next-auth";
import type { ChatMessage } from "@/lib/types";
import type { ChatModel } from "@/lib/ai/models";
import { type RequestHints } from "@/lib/ai/prompts";
import type { AppUsage } from "@/lib/usage";
import { generateUUID } from "@/lib/utils";
import { classifyMessages } from "@/lib/ai/agent/classify";
import { createResumeOptStream } from "@/lib/ai/agent/resume-opt";
import { createMockInterviewStream } from "@/lib/ai/agent/mock-interview";
import { createDefaultStream } from "@/lib/ai/agent/common";

export type CreateChatStreamOptions = {
  messages: ChatMessage[];
  selectedChatModel: ChatModel["id"];
  requestHints: RequestHints;
  session: Session;
  onFinish?: (params: { messages: ChatMessage[]; usage?: AppUsage }) => void;
};

export function createChatStream({
  messages,
  selectedChatModel,
  requestHints,
  session,
  onFinish,
}: CreateChatStreamOptions) {
  let finalMergedUsage: AppUsage | undefined;

  const stream = createUIMessageStream({
    execute: async ({ writer: dataStream }) => {
      // 先进行消息分类
      const classification = await classifyMessages(messages);
      console.log("classification => ", classification);

      let result;

      // 根据分类结果选择不同的处理方式
      if (classification.resume_opt) {
        // 简历优化
        result = createResumeOptStream(messages);
      } else if (classification.mock_interview) {
        // 模拟面试
        result = createMockInterviewStream(messages);
      } else {
        // 其他情况，执行原有逻辑
        result = createDefaultStream({
          messages,
          selectedChatModel,
          requestHints,
          session,
          dataStream,
          onUsageUpdate: (usage) => {
            finalMergedUsage = usage;
          },
        });
      }

      result.consumeStream();

      dataStream.merge(
        result.toUIMessageStream({
          sendReasoning: true,
        })
      );
    },
    generateId: generateUUID,
    onFinish: async ({ messages: finishedMessages }) => {
      if (onFinish) {
        await onFinish({
          messages: finishedMessages as ChatMessage[],
          usage: finalMergedUsage,
        });
      }
    },
    onError: () => {
      return "Oops, an error occurred!";
    },
  });

  return stream;
}

