import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Handler, HandlerEvent } from "@netlify/functions";

// Securely access the API key from environment variables on the server.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  // This error will be logged in the Netlify function logs.
  throw new Error("The API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey });
const model = "gemini-2.5-flash-preview-04-17";

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  try {
    const { base64Image, prompt } = JSON.parse(event.body || "{}");

    if (!base64Image || !prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing base64Image or prompt in request body" }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: { thinkingConfig: { thinkingBudget: 0 } },
    });

    const text = response.text;
    if (!text) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "The AI service returned an empty response." }),
            headers: { 'Content-Type': 'application/json' },
        };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error("Error in analyzeImage function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown internal error occurred.";
    
    let userMessage = "An error occurred while processing the image with the AI service.";
    if (errorMessage.includes('API key')) {
        userMessage = "The AI service API key is invalid or missing. Please check the application configuration.";
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: userMessage }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};

export { handler };
