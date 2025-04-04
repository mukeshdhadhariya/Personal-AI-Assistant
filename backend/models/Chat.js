import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  mukeshdhadhariya: String,  
  neha: String, 
  embedding: [Number],  
  timestamp: { type: Date, default: Date.now }
});

export const Chat = mongoose.model("Chat", ChatSchema);

