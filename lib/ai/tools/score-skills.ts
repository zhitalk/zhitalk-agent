import { tool } from "ai";
import { z } from "zod";

/**
 * 根据毕业时间和技能列表，对简历中的技能进行评分
 * 评审规则：毕业时间越久，工作经验越多，技能应该越多、应用越深入
 * 打分范围：5-10分
 */
export const scoreSkills = tool({
  description:
    "对简历中的技能进行评分。根据毕业时间和技能列表，评估技能的深度和广度是否与工作经验相匹配。毕业时间越久，工作经验越多，技能应该越多、应用越深入。",
  inputSchema: z.object({
    graduationYear: z
      .number()
      .int()
      .min(1950)
      .max(2100)
      .describe("毕业年份（例如：2020）"),
    skills: z
      .array(z.string())
      .min(1)
      .describe("技能列表，例如：['Java', 'Spring Boot', 'MySQL', 'Redis']"),
  }),
  execute: async ({ graduationYear, skills }) => {
    console.log('scoreSkills...');
    const currentYear = new Date().getFullYear();
    const yearsOfExperience = currentYear - graduationYear;
    const skillCount = skills.length;

    // 基础评分逻辑
    let score = 5; // 起始分数
    let feedback = "";

    // 根据工作年限评估期望的技能数量
    let expectedSkillCount = 0;
    if (yearsOfExperience <= 1) {
      expectedSkillCount = 5; // 应届生或1年经验，期望5个左右技能
    } else if (yearsOfExperience <= 3) {
      expectedSkillCount = 8; // 2-3年经验，期望8个左右技能
    } else if (yearsOfExperience <= 5) {
      expectedSkillCount = 12; // 4-5年经验，期望12个左右技能
    } else if (yearsOfExperience <= 8) {
      expectedSkillCount = 15; // 6-8年经验，期望15个左右技能
    } else {
      expectedSkillCount = 18; // 8年以上经验，期望18个以上技能
    }

    // 技能数量评分（占40%权重）
    const skillCountRatio = skillCount / expectedSkillCount;
    let skillCountScore = 5;
    if (skillCountRatio >= 1.2) {
      skillCountScore = 10; // 技能数量远超期望
      feedback += "技能数量丰富，远超同工作年限的期望值。";
    } else if (skillCountRatio >= 1.0) {
      skillCountScore = 9; // 技能数量达到期望
      feedback += "技能数量充足，符合工作年限。";
    } else if (skillCountRatio >= 0.8) {
      skillCountScore = 7; // 技能数量略低于期望
      feedback += `技能数量略少，建议补充更多技能（当前${skillCount}个，建议${expectedSkillCount}个左右）。`;
    } else if (skillCountRatio >= 0.6) {
      skillCountScore = 6; // 技能数量明显不足
      feedback += `技能数量不足，与${yearsOfExperience}年工作经验不匹配（当前${skillCount}个，建议${expectedSkillCount}个左右）。`;
    } else {
      skillCountScore = 5; // 技能数量严重不足
      feedback += `技能数量严重不足，需要大幅补充技能（当前${skillCount}个，建议${expectedSkillCount}个左右）。`;
    }

    // 技能深度评估（占60%权重）
    // 检查是否有核心技术栈的深度技能
    const hasBackendSkills =
      skills.some((skill) =>
        /java|spring|python|node|go|rust|c\+\+|php|ruby/i.test(skill)
      ) || skills.some((skill) => /后端|server|backend/i.test(skill));
    const hasFrontendSkills =
      skills.some((skill) =>
        /react|vue|angular|javascript|typescript|html|css/i.test(skill)
      ) || skills.some((skill) => /前端|frontend|web/i.test(skill));
    const hasDatabaseSkills =
      skills.some((skill) =>
        /mysql|postgresql|mongodb|redis|elasticsearch|oracle/i.test(skill)
      ) || skills.some((skill) => /数据库|database|db/i.test(skill));
    const hasDevOpsSkills =
      skills.some((skill) =>
        /docker|kubernetes|k8s|jenkins|git|ci\/cd|linux/i.test(skill)
      ) || skills.some((skill) => /运维|devops|部署/i.test(skill));
    const hasCloudSkills = skills.some((skill) =>
      /aws|azure|gcp|aliyun|腾讯云|华为云/i.test(skill)
    );

    const skillCategoryCount =
      (hasBackendSkills ? 1 : 0) +
      (hasFrontendSkills ? 1 : 0) +
      (hasDatabaseSkills ? 1 : 0) +
      (hasDevOpsSkills ? 1 : 0) +
      (hasCloudSkills ? 1 : 0);

    let skillDepthScore = 5;
    if (yearsOfExperience <= 1) {
      // 应届生：至少要有1-2个技术栈
      if (skillCategoryCount >= 2) {
        skillDepthScore = 9;
        feedback += "技能广度良好，覆盖多个技术领域。";
      } else if (skillCategoryCount >= 1) {
        skillDepthScore = 7;
        feedback += "建议扩展技能广度，学习更多技术栈。";
      } else {
        skillDepthScore = 5;
        feedback += "技能广度不足，需要学习核心技术栈。";
      }
    } else if (yearsOfExperience <= 3) {
      // 2-3年：至少要有2-3个技术栈
      if (skillCategoryCount >= 3) {
        skillDepthScore = 10;
        feedback += "技能广度优秀，技术栈覆盖全面。";
      } else if (skillCategoryCount >= 2) {
        skillDepthScore = 8;
        feedback += "技能广度良好，建议继续扩展。";
      } else {
        skillDepthScore = 6;
        feedback += "技能广度不足，建议学习更多技术栈。";
      }
    } else if (yearsOfExperience <= 5) {
      // 4-5年：至少要有3-4个技术栈
      if (skillCategoryCount >= 4) {
        skillDepthScore = 10;
        feedback += "技能广度优秀，技术栈覆盖全面。";
      } else if (skillCategoryCount >= 3) {
        skillDepthScore = 8;
        feedback += "技能广度良好，符合工作年限。";
      } else {
        skillDepthScore = 6;
        feedback += "技能广度不足，建议扩展更多技术领域。";
      }
    } else {
      // 5年以上：至少要有4-5个技术栈
      if (skillCategoryCount >= 5) {
        skillDepthScore = 10;
        feedback += "技能广度优秀，技术栈覆盖全面，符合资深开发者水平。";
      } else if (skillCategoryCount >= 4) {
        skillDepthScore = 9;
        feedback += "技能广度良好，建议继续扩展。";
      } else {
        skillDepthScore = 7;
        feedback += "技能广度需要提升，资深开发者应掌握更多技术栈。";
      }
    }

    // 综合评分（技能数量40% + 技能深度60%）
    score = Math.round(skillCountScore * 0.4 + skillDepthScore * 0.6);
    // 确保分数在5-10范围内
    score = Math.max(5, Math.min(10, score));

    // 合并反馈和建议
    const suggestions = [
      skillCount < expectedSkillCount
        ? `建议补充${expectedSkillCount - skillCount}个左右技能`
        : null,
      !hasBackendSkills && !hasFrontendSkills
        ? "建议学习至少一个核心技术栈（后端或前端）"
        : null,
      !hasDatabaseSkills ? "建议学习数据库相关技能" : null,
      yearsOfExperience >= 3 && !hasDevOpsSkills
        ? "建议学习DevOps相关技能"
        : null,
      yearsOfExperience >= 5 && !hasCloudSkills
        ? "建议学习云平台相关技能"
        : null,
    ]
      .filter((s) => s !== null)
      .join("；");

    const suggestion = [
      feedback.trim() || "技能评估完成。",
      suggestions,
    ]
      .filter((s) => s)
      .join(" ");

    console.log('scoreSkills result => ', {
      score,
    });
    return {
      score,
      suggestion,
    };
  },
});

