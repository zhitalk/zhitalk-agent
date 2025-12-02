import { gateway } from "@ai-sdk/gateway";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";
import { deepseek } from '@ai-sdk/deepseek';

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      // languageModels: {
      //   "chat-model": gateway.languageModel("xai/grok-2-vision-1212"),
      //   "chat-model-reasoning": wrapLanguageModel({
      //     model: gateway.languageModel("xai/grok-3-mini"),
      //     middleware: extractReasoningMiddleware({ tagName: "think" }),
      //   }),
      //   "title-model": gateway.languageModel("xai/grok-2-1212"),
      //   "artifact-model": gateway.languageModel("xai/grok-2-1212"),
      // },
      languageModels: {
        "chat-model": deepseek("deepseek-chat"),
        "chat-model-reasoning": wrapLanguageModel({
          model: deepseek("deepseek-reasoner"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": deepseek("deepseek-chat"),
        "artifact-model": deepseek("deepseek-chat"),
      },
    });
