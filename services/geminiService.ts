import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AssistanceTask } from '../types.ts';
import { MOCK_RESPONSES } from '../constants.ts';

// WARNING: Hardcoding API keys in client-side code is a security risk.
// This key is visible to anyone inspecting the app's code.
// This has been done as per user request for simplicity across all environments.
const API_KEY = "AIzaSyBuSZfhkBbyBCAM4Aw3JQF6cQYGbpEvBhw";

const getMockResponse = (task: AssistanceTask): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const mockText = MOCK_RESPONSES[task] || "This is a mock response for an unknown task.";
            resolve(`(Mock Response) ${mockText}`);
        }, 1500); // Simulate network delay
    });
};

export const analyzeImageWithGemini = async (base64Image: string, prompt: string, task: AssistanceTask, isMockMode: boolean): Promise<string> => {
  if (isMockMode) {
    return getMockResponse(task);
  }

  if (!API_KEY) {
      return "API Key is not configured. A hardcoded key is expected in services/geminiService.ts.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const imagePart = {
        inlineData: { mimeType: "image/jpeg", data: base64Image },
    };
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: { parts: [imagePart, textPart] },
        config: { thinkingConfig: { thinkingBudget: 0 } },
    });

    const text = response.text;
    if (!text) {
        return "The AI service returned an empty response. Please try again.";
    }
    return text;
  } catch (error) {
      console.error("Error calling Gemini API:", error);
      let errorMessage = "An error occurred while calling the Gemini API. Check the console for details.";
      if (error instanceof Error && (error.message.includes('API key') || error.message.includes('permission'))) {
          errorMessage = "The provided API key is invalid or has insufficient permissions. Please check the hardcoded key.";
      }
      return errorMessage;
  }
};