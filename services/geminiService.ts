import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AssistanceTask } from '../types.ts';
import { MOCK_RESPONSES } from '../constants.ts';

// VITE_API_KEY will be embedded at build time. If it exists, we're in a local dev or preview environment.
// If it's undefined, we're in a production environment like Netlify where we must use the serverless function.
const localApiKey = import.meta.env?.VITE_API_KEY;

const getMockResponse = (task: AssistanceTask): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const mockText = MOCK_RESPONSES[task] || "This is a mock response for an unknown task.";
            resolve(`(Mock Response) ${mockText}`);
        }, 1500); // Simulate network delay
    });
};

const callApiFromClient = async (base64Image: string, prompt: string): Promise<string> => {
    if (!localApiKey) {
        // This should not happen if the logic in analyzeImageWithGemini is correct
        throw new Error("VITE_API_KEY is not defined in your .env file for local development.");
    }
    try {
        const ai = new GoogleGenAI({ apiKey: localApiKey });
        const imagePart = { inlineData: { mimeType: "image/jpeg", data: base64Image } };
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
        console.error("Error calling Gemini API from client:", error);
        let errorMessage = "An error occurred while calling the Gemini API. Check the console for details.";
        if (error instanceof Error && (error.message.includes('API key') || error.message.includes('permission'))) {
            errorMessage = "The local API key is invalid or has insufficient permissions. Please check your .env file.";
        }
        return errorMessage;
    }
};

const callApiFromServerless = async (base64Image: string, prompt: string): Promise<string> => {
    try {
        const response = await fetch('/.netlify/functions/analyzeImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ base64Image, prompt }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch from serverless function.');
        }

        return result.text;
    } catch (error) {
        console.error("Error calling serverless function:", error);
        return `An error occurred while communicating with the server: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
};

export const analyzeImageWithGemini = async (base64Image: string, prompt: string, task: AssistanceTask, isMockMode: boolean): Promise<string> => {
    if (isMockMode) {
        return getMockResponse(task);
    }
    
    // For local development or preview where a VITE_API_KEY is available, call the API from the client.
    if (localApiKey) {
        return callApiFromClient(base64Image, prompt);
    }
    
    // For production on Netlify (where VITE_API_KEY is not set), use the secure serverless function.
    return callApiFromServerless(base64Image, prompt);
};