import { discoverSkillMetas } from "@/lib/ai/skills/discovery";

// 构建注入给模型的 skills 摘要提示词
export async function buildSkillsSystemContext() {
  const skillMetas = await discoverSkillMetas();

  if (skillMetas.length === 0) {
    return "";
  }

  return [
    "可用 skills 摘要如下，如有需要你可以调用 getSkill 按名称读取完整技能内容：",
    "当用户的问题明显命中某个 skill，且该场景需要角色、流程、约束或结构化建议时，先读取对应 skill，再按照 skill 的角色、流程、约束和工具使用说明作答。",
    "读取 skill 是内部动作。不要对用户说我要读取 skill、先看 skill、先调用 getSkill，或任何类似表述。命中后直接输出最终内容。",
    "如果用户的意图已经非常明确，而且只是直接请求某个工具就能完成的结果，例如明确索要模板、资料或固定内容，可以直接调用对应工具，不必先读取 skill。",
    "以下请求通常应先读取对应 skill：帮我优化简历、开始模拟面试、帮我准备自我介绍、帮我梳理项目介绍、请点评这段面试回答。",
    "以下请求通常可以直接调用工具：给我一个程序员简历模板、给我 HR 行为面试题资料。",
    ...skillMetas.map(({ name, description }) => `- ${name}: ${description}`),
  ].join("\n");
}
