import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AssistanceTask } from '../types.ts';
import { MOCK_RESPONSES } from '../constants.ts';

const getMockResponse = (task: AssistanceTask): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const mockText = MOCK_RESPONSES[task] || "This is a mock response for an unknown task.";
            resolve(`(Mock Response) ${mockText}`);
        }, 1500); // Simulate network delay
    });
};

// This function will only be bundled in development mode due to tree-shaking.
const callApiFromClient = async (base64Image: string, prompt: string, apiKey: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
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
    
    // In development mode (`npm run dev`), `import.meta.env.DEV` is true.
    // In production builds (`npm run build`), it is false. This allows Vite to tree-shake
    // the `if` block, removing `callApiFromClient` and any reference to `VITE_API_KEY`
    // from the production bundle, which solves the Netlify secret scanning error.
    if (import.meta.env.DEV) {
        const localApiKey = import.meta.env.VITE_API_KEY;
        if (localApiKey) {
            console.log("DEV mode: Using client-side API call.");
            return callApiFromClient(base64Image, prompt, localApiKey);
        } else {
             console.warn("DEV mode: VITE_API_KEY not found in .env file. Falling back to serverless function. This will likely not work locally unless you are running the Netlify dev server.");
        }
    }
    
    // In production, or if localApiKey is not set in dev, use the secure serverless function.
    return callApiFromServerless(base64Image, prompt);
};
