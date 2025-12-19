import { tool } from "ai";
import { z } from "zod";

async function getResumeTemplate() {
  return `

    # 程序员简历模板
    
    标题：姓名-电话-岗位
  
    ## 个人信息
    - 包括：姓名，性别，电话，邮箱，城市，学历
    - 年龄非必需，可根据毕业时间可推算出来
    - 照片非必需，如果是女生可以考虑加上照片（大部分面试官都是男的，女生有照片会多看一眼，多个机会）
  
    ## 教育经历
    - 包括：学校，专业，学历，毕业时间，获奖
    - 如果是大专或专升本，把教育经历放在最后
    
    ## 个人优势
    - 总结 2-3 条你相比于同龄人、身边同事的优势，尽量写技术相关的、写的客观一点，不要太主观

    ## 专业技能
    - 体现你的技术广度、深度，毕业时间越久，就要写的越丰富
    - 不要写“了解 xxx 技术”，要么写“熟悉 xxx 技术”，要么不写
    - 毕业时间久的，不要写太基础的技能，这样会显得自己技术视野太低
    
    ## 工作/实习 经历
    - 包括：公司，职位，时间，工作内容，工作成果

    ## 项目经验
    - 包括：项目名称，时间，项目描述，项目职责，项目成果
  `;
}

export const getResumeTemplateTool = tool({
  description: "获取程序员简历模板。当用户需要查看简历模板或不知道如何写简历时，可以使用此工具获取标准的简历模板格式。",
  inputSchema: z.object({}),
  execute: async () => {
    // console.log("getResumeTemplateTool called ......");
    const template = await getResumeTemplate();
    return {
      template,
    };
  },
});
