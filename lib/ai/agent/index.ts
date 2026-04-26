import { createUIMessageStream } from "ai";
import type { Session } from "next-auth";
import { createDefaultStream } from "@/lib/ai/agent/common";
import type { ChatModel } from "@/lib/ai/models";
import type { RequestHints } from "@/lib/ai/prompts";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { generateUUID } from "@/lib/utils";

export type CreateChatStreamOptions = {
  messages: ChatMessage[];
  selectedChatModel: ChatModel["id"];
  requestHints: RequestHints;
  systemContext?: string;
  session: Session;
  onFinish?: (params: { messages: ChatMessage[]; usage?: AppUsage }) => void;
};

// 根据分类结果创建对应的聊天流
export function createChatStream({
  messages,
  selectedChatModel,
  requestHints,
  systemContext,
  session,
  onFinish,
}: CreateChatStreamOptions) {
  let finalMergedUsage: AppUsage | undefined;

  const stream = createUIMessageStream({
    execute: async ({ writer: dataStream }) => {
      const onUsageUpdate = (usage: AppUsage) => {
        finalMergedUsage = usage;
      };

      const result = await createDefaultStream({
        messages,
        selectedChatModel,
        requestHints,
        systemContext,
        session,
        dataStream,
        onUsageUpdate,
      });

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
