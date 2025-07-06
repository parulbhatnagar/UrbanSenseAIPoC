
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// The API key is provided by the execution environment as process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
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
    if (error instanceof Error && (error.message.includes('API key') || error.message.includes('permission'))) {
        return "The application is currently unable to connect to the AI service. This might be due to an invalid or missing API key, or network issues.";
    }
    return "An unknown error occurred while contacting the AI. Please try again later.";
  }
};
