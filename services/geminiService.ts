
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// In a Vite project, environment variables are exposed on the client via `import.meta.env`.
// For security, only variables prefixed with `VITE_` are exposed.
const apiKey = import.meta.env.VITE_API_KEY;

// Initialize the GoogleGenAI client. If apiKey is undefined, the API call will fail gracefully
// and the error will be caught and handled in the `analyzeImageWithGemini` function.
const ai = new GoogleGenAI({ apiKey: apiKey });

export const analyzeImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  if (!apiKey) {
     const errorMessage = "API Key is not configured. Please ensure the VITE_API_KEY environment variable is set correctly in your deployment settings.";
     console.error(errorMessage);
     return errorMessage;
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
    if (error instanceof Error && (error.message.includes('API key') || error.message.includes('permission') || error.message.includes('400'))) {
        return "The application is currently unable to connect to the AI service. This might be due to an invalid or missing API key. Please check that your VITE_API_KEY is correct.";
    }
    return "An unknown error occurred while contacting the AI. Please try again later.";
  }
};
