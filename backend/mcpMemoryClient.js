import { NodeChildProcessTransport } from "@modelcontextprotocol/sdk/client/node.js";

let child = new NodeChildProcessTransport({
  command: "node",
  args: ["./memoryServer.js"],
});

export const mcp = new McpClient({ transport: child });
await mcp.connect();
