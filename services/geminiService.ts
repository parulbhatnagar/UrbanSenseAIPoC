
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// --- IMPORTANT ---
// Replace "YOUR_API_KEY_HERE" with your actual Google Gemini API key.
// For security reasons, it is strongly recommended to use environment variables
// in a production environment instead of hardcoding the key in the source code.
const API_KEY = "AIzaSyBuSZfhkBbyBCAM4Aw3JQF6cQYGbpEvBhw";

// Initialize the GoogleGenAI client with the hardcoded API key.
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  // Check if the API key has been replaced.
  if (API_KEY === "YOUR_API_KEY_HERE" || !API_KEY) {
    const errorMsg = "API Key not set. Please open 'services/geminiService.ts' and replace 'YOUR_API_KEY_HERE' with your actual Gemini API key.";
    console.error(errorMsg);
    return errorMsg;
  }

  try {
    const model = 'gemini-2.5-flash-preview-04-17';

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    
    const text = response.text;
    if (!text) {
        return "I'm sorry, I couldn't analyze the image. Please try again.";
    }
    return text;

  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    if (error instanceof Error && error.message.includes('API key')) {
        return "The application is currently unable to connect to the AI service. This might be due to an invalid API key or network issues.";
    }
    return "An unknown error occurred while contacting the AI. Please try again later.";
  }
};
