import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config(); 

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY; 

const hf = new HfInference(HF_API_KEY); 

const generateEmbedding = async (text) => {
  try {
    const response = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text,
    });

    if (!response) throw new Error("Invalid response from Hugging Face API.");

    return response; 
  } catch (error) {
    console.error("❌ Error generating embedding:", error.message);
    return null;
  }
};

export { generateEmbedding };

