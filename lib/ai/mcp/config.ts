/**
 * MCP Server 配置
 * 对应 Cursor 中的 mcpServers 配置
 */
export const mcpServers = {
  "interview-hr-questions": {
    url: "http://localhost:3100/mcp",
    headers: {} as Record<string, string>,
  },
} as const;
