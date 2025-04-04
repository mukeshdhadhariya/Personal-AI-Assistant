import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import gtts from "gtts";
import fs from 'fs'
import { Chat } from "./models/Chat.js";

import { generateEmbedding } from "./utils/AiResponce.js";

import { cosineSimilarity } from "./utils/Cos.js"; 

import { trainingContent } from "./utils/trainingdata.js";

import { Dbconnect } from "./DB/Db.js";

import { openApp } from "./utils/openApp.js";

import {  WhatsApp } from "./utils/whatsapp.js"

import { closeapp } from "./utils/closewhatsapp.js";

dotenv.config();
const app = express();

Dbconnect().then(()=>{
  console.log("connected")
}).catch((err)=>{
  console.log("error : ",err)
})

app.use(cors({ origin: process.env.CORS_URL, credentials: true }));
app.use(express.json());

const sanitizeResponse = (text) => {
  return text.replace(/[./\~`|}{\]&##%%^*^(&!@#)(_&+?<>]/g, "").replace(/[\uD800-\uDFFF]/g, ""); // Remove special characters & emojis
};


app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const action = openApp(message);
  
    if (action) return res.json({ reply: action });

    const act= WhatsApp(message);

    if(act){
      return res.json({ reply: act });
    }

    const act1=await closeapp(message)

    if(act1){
      return res.json({ reply: act1 });
    }


      const embedding = await generateEmbedding(message);

      const pastChats = await Chat.find();
      let bestMatch = null, bestScore = 0;
  
      for (let chat of pastChats) {
        let similarity = cosineSimilarity(embedding, chat.embedding);
        if (similarity > bestScore) {
          bestScore = similarity;
          bestMatch = chat;
        }
      }

      let context= "";
      if (bestMatch && bestScore >=0.5) {
        context = `Previously, Mukesh said: "${bestMatch.mukeshdhadhariya}" and Neha replied: "${bestMatch.neha}".`;
      }

    const pastMessages = await Chat.find().sort({ timestamp: -1 }).limit(10);
    const formattedPastMessages = pastMessages.map(chat => ({
      role: "user",
      content: chat.mukeshdhadhariya,
    }));

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: trainingContent },
          ...formattedPastMessages,
          { role: "user", content: message },
          { role: "assistant", content: context },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );


    if (!response.data || !response.data.choices || !response.data.choices[0].message) {
      throw new Error("Invalid API response format.");
    }

    let replyText = sanitizeResponse(response.data.choices[0].message.content);


    const chatEntry = new Chat({ mukeshdhadhariya: message, neha: replyText });

    await chatEntry
      .save()
      .then(() => console.log("Chat saved successfully"))
      .catch((err) => console.error("Error saving chat:", err));

    const uniqueFileName = `speech_${Date.now()}.mp3`;
    const filePath = `./public/${uniqueFileName}`;

    const directory = "./public";
    fs.readdir(directory, (err, files) => {
      if (!err) {
        files.forEach((file) => {
          if (file.startsWith("speech_")) {
            fs.unlink(`${directory}/${file}`, (err) => {
              if (err) console.error("Error deleting old file:", err);
            });
          }
        });
      }
    });

    const tts = new gtts(replyText, "hi");
    tts.save(filePath, (err) => {
      if (err) {
        console.error("TTS Error:", err);
        return res.status(500).json({ error: "TTS generation failed" });
      }

      res.json({
        reply: replyText,
        audio: `http://localhost:5000/${uniqueFileName}`,
      });
    });



  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});


app.use(express.static("public")); 

app.listen(process.env.PORT || 5000, () => console.log(`Server running on http://localhost:${process.env.PORT || 5000}`));
