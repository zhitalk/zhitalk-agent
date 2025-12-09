import {
  convertToModelMessages,
  createUIMessageStream,
  smoothStream,
  stepCountIs,
  streamText,
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
import { generateUUID } from "@/lib/utils";

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
    execute: ({ writer: dataStream }) => {
      const result = streamText({
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
        onFinish: async ({ usage }) => {
          try {
            const providers = await getTokenlensCatalog();
            const modelId =
              myProvider.languageModel(selectedChatModel).modelId;
            if (!modelId) {
              finalMergedUsage = usage;
              dataStream.write({
                type: "data-usage",
                data: finalMergedUsage,
              });
              return;
            }

            if (!providers) {
              finalMergedUsage = usage;
              dataStream.write({
                type: "data-usage",
                data: finalMergedUsage,
              });
              return;
            }

            const summary = getUsage({ modelId, usage, providers });
            finalMergedUsage = { ...usage, ...summary, modelId } as AppUsage;
            dataStream.write({ type: "data-usage", data: finalMergedUsage });
          } catch (err) {
            console.warn("TokenLens enrichment failed", err);
            finalMergedUsage = usage;
            dataStream.write({ type: "data-usage", data: finalMergedUsage });
          }
        },
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

