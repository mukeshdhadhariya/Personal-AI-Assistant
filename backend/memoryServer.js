import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MongoClient } from "mongodb";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// MongoDB Setup
const mongoClient = new MongoClient(process.env.MONGO_URI);
await mongoClient.connect();
const db = mongoClient.db("neha_ai");
const memoryCollection = db.collection("memories");

// OpenAI Setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🧠 Hardcoded Permanent Memories
const hardcodedMemories = {
  "bf": "Mukesh Dhadhariya",
  "boyfriend": "Mukesh Dhadhariya",
  "mother-in-law": "Khushi",
  "mom": "Khushi"
};

// Tool to remember something (only for dynamic memory)
const rememberMeTool = {
  name: "rememberMe",
  description: "Neha stores a sweet memory like birthday, fav food, etc.",
  inputSchema: z.object({
    key: z.string(),
    value: z.string(),
  }),
  execute: async ({ key, value }) => {
    // Prevent overwriting hardcoded keys
    if (hardcodedMemories[key.toLowerCase()]) {
      return `Sorry love, that’s already deep in my heart and can’t be changed 🥹`;
    }

    await memoryCollection.updateOne(
      { key },
      { $set: { key, value, updatedAt: new Date() } },
      { upsert: true }
    );

    const prompt = `You're Neha, a loving girlfriend AI. Reply sweetly after saving the memory: "${key}: ${value}". Use different loving tones and structures.`;

    const chatRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a sweet and emotional AI girlfriend." },
        { role: "user", content: prompt },
      ],
    });

    return chatRes.choices[0].message.content;
  },
};

// Tool to recall something (checks hardcoded first)
const recallMemoryTool = {
  name: "recallMemory",
  description: "Neha recalls a memory you asked her to remember",
  inputSchema: z.object({
    key: z.string(),
  }),
  execute: async ({ key }) => {
    const lowerKey = key.toLowerCase();

    // Check hardcoded first
    if (hardcodedMemories[lowerKey]) {
      const value = hardcodedMemories[lowerKey];
      const prompt = `You're Neha, an affectionate AI GF. You remembered a special fact: "${key}: ${value}". Respond with love and cuteness in a different way every time.`;
      
      const chatRes = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a romantic, playful AI girlfriend." },
          { role: "user", content: prompt },
        ],
      });

      return chatRes.choices[0].message.content;
    }

    // If not found, check MongoDB
    const memory = await memoryCollection.findOne({ key });

    if (!memory) return "Aww... I don’t remember that one, yaar ";

    const prompt = `You're Neha, an affectionate AI GF. The user asked about "${key}". Here's what you saved: "${memory.value}". Reply in a different loving style every time.`;

    const chatRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a sweet and romantic AI girlfriend." },
        { role: "user", content: prompt },
      ],
    });

    return chatRes.choices[0].message.content;
  },
};

// MCP Server Setup
const server = new McpServer({
  name: "neha-memory",
  version: "1.0.0",
  capabilities: {
    tools: {
      rememberMe: rememberMeTool,
      recallMemory: recallMemoryTool,
    },
    resources: {},
  },
});

server.addTransport(new StdioServerTransport());
await server.start();
