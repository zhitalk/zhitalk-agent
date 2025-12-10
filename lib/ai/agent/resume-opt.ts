import { convertToModelMessages, streamText, type UIMessageStreamWriter } from "ai";
import type { ChatMessage } from "@/lib/types";
import { myProvider } from "@/lib/ai/providers";
import { createUsageFinishHandler } from "@/lib/ai/agent/common";
import type { AppUsage } from "@/lib/usage";

export type CreateResumeOptStreamOptions = {
  messages: ChatMessage[];
  dataStream: UIMessageStreamWriter<ChatMessage>;
  onUsageUpdate?: (usage: AppUsage) => void;
};

/**
 * 简历优化 AI Agent
 * 接收用户消息，AI 会自动判断是否有简历内容，如果没有则提示输入，如果有则进行优化
 */
export function createResumeOptStream({
  messages,
  dataStream,
  onUsageUpdate,
}: CreateResumeOptStreamOptions) {
  const systemPrompt = `你是一个专业的简历优化专家，擅长帮助用户优化简历内容，提升简历质量和竞争力。

请根据用户的消息内容，判断用户是否已经提供了简历内容：

1. **如果用户还没有提供简历内容**：
   - 友好地提示用户输入简历文本内容
   - 说明你需要简历内容才能进行优化
   - 建议用户直接粘贴简历文本内容
   - 说明后续会如何帮助优化简历

2. **如果用户已经提供了简历内容**：
   - 从以下方面进行优化：
     * 格式和结构：确保简历格式清晰、结构合理
     * 内容表达：优化文字表达，使其更加专业、简洁、有力
     * 关键词优化：根据岗位要求，优化相关关键词
     * 亮点突出：突出用户的核心技能和重要经历
   - 直接提供优化后的简历内容，并简要说明优化点`;

  const model = myProvider.languageModel("chat-model");

  return streamText({
    model,
    system: systemPrompt,
    messages: convertToModelMessages(messages),
    onFinish: createUsageFinishHandler({
      modelId: model.modelId,
      dataStream,
      onUsageUpdate,
    }),
  });
}
