import { NodeChildProcessTransport, McpClient } from '@modelcontextprotocol/sdk';

let child = new NodeChildProcessTransport({
  command: "node",
  args: ["./memoryServer.js"],
});

export const mcp = new McpClient({ transport: child });

(async () => {
  try {
    await mcp.connect();
    console.log("MCP Client connected successfully");
  } catch (err) {
    console.error("Failed to connect MCP Client:", err);
    process.exit(1);
  }
})();