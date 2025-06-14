// import { HfInference } from "@huggingface/inference";
// import dotenv from "dotenv";

// dotenv.config(); 

// const HF_API_KEY = process.env.HUGGINGFACE_API_KEY; 

// const hf = new HfInference(HF_API_KEY); 

// const generateEmbedding = async (text) => {
//   try {
//     console.log("1")
//     let response = await hf.featureExtraction({
//       model: "intfloat/e5-small-v2",
//       inputs: text,
//     });

//     console.log("2")

//     if (!response) throw new Error("Invalid response from Hugging Face API.");

//     return response; 
//   } catch (error) {
//     console.error("❌ Error generating embedding:", error.message);
//     return null;
//   }
// };

// export { generateEmbedding };

import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

const generateEmbedding = async (text) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!Array.isArray(response.data)) throw new Error("Embedding failed");

    return response.data;
  } catch (error) {
    console.error("❌ Raw API Error:", error.response?.data || error.message);
    return null;
  }
};

export { generateEmbedding };
