export type SkillMeta = {
  name: string;
  description: string;
  path: string;
};

export type SkillFrontmatter = Pick<SkillMeta, "name" | "description">;
