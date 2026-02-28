// import { tool } from "ai";
// import { z } from "zod";

// const BEHAVIOURAL_QUESTIONS_URL =
//   "https://raw.githubusercontent.com/mianshipai/mianshipai-web/refs/heads/main/docs/hr-exam/behavioural-test.md";

// async function fetchBehaviouralQuestions(): Promise<string> {
//   try {
//     const response = await fetch(BEHAVIOURAL_QUESTIONS_URL);
//     if (!response.ok) {
//       throw new Error(
//         `Failed to fetch behavioural questions: ${response.status} ${response.statusText}`
//       );
//     }
//     const content = await response.text();
//     return content;
//   } catch (error) {
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error occurred";
//     throw new Error(`Error fetching behavioural questions: ${errorMessage}`);
//   }
// }

// export const getBehaviouralQuestionsTool = tool({
//   description:
//     "获取 HR 行为面试题和答案。当用户提问到 HR 行为面试时，使用此工具从 GitHub 获取最新的行为面试题和答案列表。",
//   inputSchema: z.object({}),
//   execute: async () => {
//     const content = await fetchBehaviouralQuestions();
//     return {
//       content,
//     };
//   },
// });

