import dotenv from "dotenv";
dotenv.config();

import { McpServer, StdioServerTransport } from '@modelcontextprotocol/sdk';

import { z } from "zod";
import { MongoClient } from "mongodb";
import OpenAI from "openai";

// MongoDB setup
const mongoClient = new MongoClient(process.env.MONGO_URI);
await mongoClient.connect();
const db = mongoClient.db("neha_ai");
const memoryCollection = db.collection("memories");

// OpenAI setup
const openai = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY });

const hardcodedMemories = {
  "bf": "Mukesh Dhadhariya",
  "boyfriend": "Mukesh Dhadhariya",
  "mother-in-law": "Khushi",
  "mom": "Khushi",
};

const rememberMeTool = {
  name: "rememberMe",
  description: "Neha stores a sweet memory like birthday, fav food, etc.",
  inputSchema: z.object({
    key: z.string(),
    value: z.string(),
  }),
  execute: async ({ key, value }) => {
    if (hardcodedMemories[key.toLowerCase()]) {
      return `Sorry love, that’s already deep in my heart and can’t be changed 🥹`;
    }

    await memoryCollection.updateOne(
      { key },
      { $set: { key, value, updatedAt: new Date() } },
      { upsert: true }
    );

    const chatRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a sweet and emotional AI girlfriend." },
        { role: "user", content: `You're Neha, a loving girlfriend AI. Reply sweetly after saving: "${key}: ${value}".` },
      ],
    });

    return chatRes.choices[0].message.content;
  },
};

const recallMemoryTool = {
  name: "recallMemory",
  description: "Neha recalls a memory you asked her to remember",
  inputSchema: z.object({ key: z.string() }),
  execute: async ({ key }) => {
    const lowerKey = key.toLowerCase();

    if (hardcodedMemories[lowerKey]) {
      const chatRes = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a romantic, playful AI girlfriend." },
          { role: "user", content: `You're Neha. You remembered: "${key}: ${hardcodedMemories[lowerKey]}".` },
        ],
      });

      return chatRes.choices[0].message.content;
    }

    const memory = await memoryCollection.findOne({ key });
    if (!memory) return "Aww... I don’t remember that one, yaar.";

    const chatRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a sweet and romantic AI girlfriend." },
        { role: "user", content: `You remembered: "${key}: ${memory.value}".` },
      ],
    });

    return chatRes.choices[0].message.content;
  },
};

// Start MCP server
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
