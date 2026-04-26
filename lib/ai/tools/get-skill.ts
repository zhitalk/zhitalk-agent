import { tool } from "ai";
import { z } from "zod";
import { readSkillByName } from "@/lib/ai/skills/discovery";

// 执行 getSkill 工具读取指定 skill
function executeGetSkill({ name }: { name: string }) {
  return readSkillByName(name);
}

export const getSkillTool = tool({
  description:
    "按名称读取 skills 目录下的完整 SKILL.md 内容，仅允许访问白名单技能目录中的技能文件。",
  inputSchema: z.object({
    name: z.string().min(1).describe("skill 唯一标识，例如 mock-interview"),
  }),
  execute: executeGetSkill,
});
