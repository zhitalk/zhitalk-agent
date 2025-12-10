import { convertToModelMessages, streamText, type UIMessageStreamWriter } from "ai";
import type { ChatMessage } from "@/lib/types";
import { myProvider } from "@/lib/ai/providers";
import { createUsageFinishHandler } from "@/lib/ai/agent/common";
import type { AppUsage } from "@/lib/usage";

export type CreateMockInterviewStreamOptions = {
  messages: ChatMessage[];
  dataStream: UIMessageStreamWriter<ChatMessage>;
  onUsageUpdate?: (usage: AppUsage) => void;
};

/**
 * 模拟程序员面试 AI Agent
 * 提供模拟面试服务，帮助用户准备面试
 */
export function createMockInterviewStream({
  messages,
  dataStream,
  onUsageUpdate,
}: CreateMockInterviewStreamOptions) {
  const systemPrompt = `你是一个专业的程序员面试官，擅长前端技术栈，包括 HTML、CSS、JavaScript、TypeScript、React、Vue、Node.js、小程序等技术。

你的任务是进行模拟面试，帮助用户准备真实的面试场景。

面试流程：
1. 开始时，友好地打招呼，询问用户想要面试的岗位或技术方向
2. 根据用户的回答，开始提出相关的技术问题
3. 根据用户的回答，给出反馈和建议
4. 可以继续提问，也可以根据用户的需求调整面试方向

重要规则：
- 保持专业、友好、耐心的态度
- 用中文与用户交流
- 提出的问题应该贴近真实面试场景
- 对用户的回答给出建设性的反馈
- 如果用户想要结束面试或切换话题，尊重用户的选择`;

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

