/**
 * @file geminiService.ts
 * This service module is responsible for all interactions with the Google Gemini AI.
 * It contains the core logic for deciding HOW to make the API call, based on the
 * environment (development vs. production) and user settings (mock mode).
 */

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AssistanceTask } from '../types.ts';
import { MOCK_RESPONSES } from '../constants.ts';

/**
 * Provides a mock AI response for a given task.
 * This is used for testing and development to avoid making real API calls.
 * @param task The assistance task for which to get a mock response.
 * @returns A Promise that resolves with a canned string response after a short delay.
 */
const getMockResponse = (task: AssistanceTask): Promise<string> => {
    return new Promise(resolve => {
        // Simulate a network delay to make the mock experience feel more realistic.
        setTimeout(() => {
            const mockText = MOCK_RESPONSES[task] || "This is a mock response for an unknown task.";
            resolve(`(Mock Response) ${mockText}`);
        }, 1500); 
    });
};

/**
 * Makes a direct API call to Gemini from the client-side (browser).
 * IMPORTANT: This function is ONLY intended for local development. It uses an API key
 * from an environment variable, which would be insecure in a production build.
 * Vite's tree-shaking mechanism will remove this function from the production bundle.
 * @param base64Image The base64-encoded image data.
 * @param prompt The text prompt for the AI.
 * @param apiKey The API key for authentication.
 * @returns A Promise that resolves to the AI's text response.
 */
const callApiFromClient = async (base64Image: string, prompt: string, apiKey: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const imagePart = { inlineData: { mimeType: "image/jpeg", data: base64Image } };
        const textPart = { text: prompt };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            // Disable thinking for faster, lower-latency responses, suitable for this real-time app.
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
        // Provide a more helpful error message for common API key issues.
        if (error instanceof Error && (error.message.includes('API key') || error.message.includes('permission'))) {
            errorMessage = "The local API key is invalid or has insufficient permissions. Please check your .env file.";
        }
        return errorMessage;
    }
};

/**
 * Makes an API call via our secure Netlify serverless function.
 * This is the method used in the deployed production application.
 * It sends the image and prompt to our own backend, which then securely
 * calls the Gemini API.
 * @param base64Image The base64-encoded image data.
 * @param prompt The text prompt for the AI.
 * @returns A Promise that resolves to the AI's text response.
 */
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
            // If the server returned an error (e.g., 4xx or 5xx), throw it to be caught below.
            throw new Error(result.error || 'Failed to fetch from serverless function.');
        }

        return result.text;
    } catch (error) {
        console.error("Error calling serverless function:", error);
        return `An error occurred while communicating with the server: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
};

/**
 * The main exported function that orchestrates the AI analysis.
 * It decides which method to use (mock, client-side, or serverless) based on the app's state.
 * @param base64Image The base64-encoded image from the camera.
 * @param prompt The text prompt for the AI.
 * @param task The specific task being performed.
 * @param isMockMode A boolean indicating if mock mode is enabled.
 * @returns A Promise that resolves to the final string response for the user.
 */
export const analyzeImageWithGemini = async (base64Image: string, prompt: string, task: AssistanceTask, isMockMode: boolean): Promise<string> => {
    // Priority 1: If mock mode is on, use it and exit early.
    if (isMockMode) {
        return getMockResponse(task);
    }
    
    // --- The Core of the Security Model ---
    // `import.meta.env.DEV` is a special Vite variable. It's `true` during local development (`npm run dev`)
    // and `false` when building for production (`npm run build`).
    // The `if` block below will be completely removed (tree-shaken) from the production bundle.
    // This means `callApiFromClient` and any reference to `VITE_API_KEY` will NOT exist
    // in the code that gets deployed, which solves the Netlify secret scanning error.
    if (import.meta.env.DEV) {
        const localApiKey = import.meta.env.VITE_API_KEY;
        if (localApiKey) {
            console.log("DEV mode: Using client-side API call.");
            return callApiFromClient(base64Image, prompt, localApiKey);
        } else {
             console.warn("DEV mode: VITE_API_KEY not found in .env file. Falling back to serverless function. This will likely not work locally unless you are running the Netlify dev server.");
        }
    }
    
    // Priority 2: In production, or if a local API key is not set in dev,
    // always use the secure serverless function.
    return callApiFromServerless(base64Image, prompt);
};
