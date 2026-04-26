import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { SkillFrontmatter, SkillMeta } from "@/lib/ai/skills/types";

const SKILLS_DIR = path.join(process.cwd(), "skills");
const SKILL_ENTRY_FILE = "SKILL.md";
const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/;
const QUOTED_VALUE_REGEX = /^['"]|['"]$/g;

// 提取 frontmatter 原始内容
function getFrontmatterBlock(content: string): string {
  const match = content.match(FRONTMATTER_REGEX);

  if (!match) {
    throw new Error("SKILL.md 缺少合法的 frontmatter");
  }

  return match[1];
}

// 读取 frontmatter 指定字段
function getFrontmatterValue(block: string, key: string): string {
  const match = block.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  const value = match?.[1]?.trim();

  if (!value) {
    throw new Error(`SKILL.md 缺少必填字段: ${key}`);
  }

  return value.replace(QUOTED_VALUE_REGEX, "");
}

// 判断路径是否位于 skills 白名单目录中
function isPathInsideSkillsDir(skillPath: string): boolean {
  const relativePath = path.relative(SKILLS_DIR, skillPath);

  return !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
}

// 解析 skill 的 frontmatter 元信息
export function parseSkillFrontmatter(content: string): SkillFrontmatter {
  const frontmatter = getFrontmatterBlock(content);

  return {
    name: getFrontmatterValue(frontmatter, "name"),
    description: getFrontmatterValue(frontmatter, "description"),
  };
}

// 扫描 skills 目录并生成 skill 摘要列表
export async function discoverSkillMetas(): Promise<SkillMeta[]> {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });

  const skillMetas = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const skillPath = path.join(SKILLS_DIR, entry.name, SKILL_ENTRY_FILE);
        const content = await readFile(skillPath, "utf8");
        const meta = parseSkillFrontmatter(content);

        return {
          ...meta,
          path: skillPath,
        };
      })
  );

  return skillMetas.sort((left, right) => left.name.localeCompare(right.name));
}

// 按名称读取完整的 skill 内容
export async function readSkillByName(name: string) {
  const skillMetas = await discoverSkillMetas();
  const skillMeta = skillMetas.find((item) => item.name === name);

  if (!skillMeta) {
    throw new Error(`Skill not found: ${name}`);
  }

  if (!isPathInsideSkillsDir(skillMeta.path)) {
    throw new Error(`Skill path is not allowed: ${skillMeta.path}`);
  }

  const content = await readFile(skillMeta.path, "utf8");

  return {
    name: skillMeta.name,
    description: skillMeta.description,
    content,
  };
}

export const skillDiscoveryConfig = {
  skillsDir: SKILLS_DIR,
  entryFileName: SKILL_ENTRY_FILE,
};
