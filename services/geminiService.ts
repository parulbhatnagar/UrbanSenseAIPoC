
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// This is a placeholder. The actual key will be provided by the user via the UI.
export const API_KEY_PLACEHOLDER = "YOUR_API_KEY_HERE";

export const analyzeImageWithGemini = async (base64Image: string, prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey || apiKey === API_KEY_PLACEHOLDER) {
    const errorMsg = "API Key not provided. Please set your API key in the app.";
    console.error(errorMsg);
    return errorMsg;
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
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
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
             return "Your API key is not valid. Please check it and save it again.";
        }
        return `An error occurred: ${error.message}`;
    }
    return "An unknown error occurred while contacting the AI.";
  }
};
