import {
  convertToModelMessages,
  smoothStream,
  stepCountIs,
  streamText,
  type LanguageModelUsage,
  type UIMessageStreamWriter,
} from "ai";
import { unstable_cache as cache } from "next/cache";
import type { Session } from "next-auth";
import type { ModelCatalog } from "tokenlens/core";
import { fetchModels } from "tokenlens/fetch";
import { getUsage } from "tokenlens/helpers";
import type { ChatMessage } from "@/lib/types";
import type { ChatModel } from "@/lib/ai/models";
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocument } from "@/lib/ai/tools/create-document";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { isProductionEnvironment } from "@/lib/constants";
import type { AppUsage } from "@/lib/usage";

const getTokenlensCatalog = cache(
  async (): Promise<ModelCatalog | undefined> => {
    try {
      return await fetchModels();
    } catch (err) {
      console.warn(
        "TokenLens: catalog fetch failed, using default catalog",
        err
      );
      return; // tokenlens helpers will fall back to defaultCatalog
    }
  },
  ["tokenlens-catalog"],
  { revalidate: 24 * 60 * 60 } // 24 hours
);

export type CreateUsageFinishHandlerOptions = {
  modelId: string | undefined;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  onUsageUpdate?: (usage: AppUsage) => void;
};

/**
 * 创建 usage finish 处理函数，用于处理 TokenLens enrichment 和 usage 更新
 * 这是一个公共函数，可以在不同的 stream 创建函数中复用
 */
export function createUsageFinishHandler({
  modelId,
  dataStream,
  onUsageUpdate,
}: CreateUsageFinishHandlerOptions) {
  return async ({ usage }: { usage: LanguageModelUsage }) => {
    try {
      const providers = await getTokenlensCatalog();
      if (!modelId) {
        const finalMergedUsage = usage;
        dataStream.write({
          type: "data-usage",
          data: finalMergedUsage,
        });
        if (onUsageUpdate) {
          onUsageUpdate(finalMergedUsage);
        }
        return;
      }

      if (!providers) {
        const finalMergedUsage = usage;
        dataStream.write({
          type: "data-usage",
          data: finalMergedUsage,
        });
        if (onUsageUpdate) {
          onUsageUpdate(finalMergedUsage);
        }
        return;
      }

      const summary = getUsage({ modelId, usage, providers });
      const finalMergedUsage = {
        ...usage,
        ...summary,
        modelId,
      } as AppUsage;
      dataStream.write({ type: "data-usage", data: finalMergedUsage });
      if (onUsageUpdate) {
        onUsageUpdate(finalMergedUsage);
      }
    } catch (err) {
      console.warn("TokenLens enrichment failed", err);
      const finalMergedUsage = usage;
      dataStream.write({ type: "data-usage", data: finalMergedUsage });
      if (onUsageUpdate) {
        onUsageUpdate(finalMergedUsage);
      }
    }
  };
}

export type CreateDefaultStreamOptions = {
  messages: ChatMessage[];
  selectedChatModel: ChatModel["id"];
  requestHints: RequestHints;
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  onUsageUpdate?: (usage: AppUsage) => void;
};

export function createDefaultStream({
  messages,
  selectedChatModel,
  requestHints,
  session,
  dataStream,
  onUsageUpdate,
}: CreateDefaultStreamOptions) {
  return streamText({
    model: myProvider.languageModel(selectedChatModel),
    system: systemPrompt({ selectedChatModel, requestHints }),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    experimental_activeTools:
      selectedChatModel === "chat-model-reasoning"
        ? []
        : [
            "getWeather",
            "createDocument",
            "updateDocument",
            "requestSuggestions",
          ],
    experimental_transform: smoothStream({ chunking: "word" }),
    tools: {
      getWeather,
      createDocument: createDocument({ session, dataStream }),
      updateDocument: updateDocument({ session, dataStream }),
      requestSuggestions: requestSuggestions({
        session,
        dataStream,
      }),
    },
    experimental_telemetry: {
      isEnabled: isProductionEnvironment,
      functionId: "stream-text",
    },
    onFinish: createUsageFinishHandler({
      modelId: myProvider.languageModel(selectedChatModel).modelId,
      dataStream,
      onUsageUpdate,
    }),
  });
}

