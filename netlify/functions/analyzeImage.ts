/**
 * @file analyzeImage.ts
 * This is a Netlify serverless function that acts as a secure backend proxy
 * for making calls to the Google Gemini API. It is used ONLY in the production environment.
 * Its primary purpose is to keep the `API_KEY` secret and not expose it in the public-facing frontend code.
 */

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Handler, HandlerEvent } from "@netlify/functions";

/**
 * --- Architectural Best Practice: Client Initialization Outside the Handler ---
 * The GoogleGenAI client is initialized here, outside the main `handler` function.
 * This is a crucial performance optimization for serverless environments.
 * When a serverless function is "warm" (i.e., it has been invoked recently),
 * this initialized `ai` instance and its underlying TCP connections can be reused
 * across multiple invocations. This significantly reduces latency compared to creating a new
 * client on every request. This approach is non-blocking and scales efficiently with concurrent user requests.
 */
const apiKey = process.env.API_KEY;
if (!apiKey) {
  // This check runs when the function is initialized. It will cause a deployment failure
  // if the API_KEY environment variable is not set in the Netlify dashboard.
  // This is a "fail-fast" approach that prevents a misconfigured function from ever being deployed.
  throw new Error("The API_KEY environment variable is not set in the Netlify environment.");
}
const ai = new GoogleGenAI({ apiKey });
const model = "gemini-2.5-flash"; // Use the stable, fast model.


const handler: Handler = async (event: HandlerEvent) => {
  // --- 1. Request Method Validation ---
  // Ensure the incoming request uses the POST method. This is a standard RESTful practice.
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405, // 405 Method Not Allowed
      body: JSON.stringify({ error: "This function only accepts POST requests." }),
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    };
  }

  // --- 2. Safe JSON Parsing ---
  // The request body is expected to be a JSON string. We wrap the parsing in a try-catch
  // block to gracefully handle malformed or empty bodies.
  let requestBody;
  try {
    requestBody = JSON.parse(event.body || "{}");
  } catch (parseError) {
    console.error("Error parsing JSON body:", parseError);
    return {
      statusCode: 400, // 400 Bad Request
      body: JSON.stringify({ error: "Invalid JSON format in request body." }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
  
  const { base64Image, prompt } = requestBody;

  // --- 3. Input Parameter Validation ---
  // Verify that the necessary data (`base64Image` and `prompt`) exists in the request body.
  if (!base64Image || !prompt) {
    return {
      statusCode: 400, // 400 Bad Request
      body: JSON.stringify({ error: "Request body must contain 'base64Image' and 'prompt'." }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // --- 4. Perform the Non-Blocking API Call to Gemini ---
  try {
    const imagePart = { inlineData: { mimeType: "image/jpeg", data: base64Image } };
    const textPart = { text: prompt };

    // This is the actual, asynchronous call to the Gemini API.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: { thinkingConfig: { thinkingBudget: 0 } }, // Disable thinking for low-latency responses.
    });

    const text = response.text;
    if (!text) {
      // This case handles a valid API call that successfully returns, but with no text content.
      console.warn("Gemini API returned a successful response with no text.");
      return {
        statusCode: 200,
        body: JSON.stringify({ text: "The AI analysis resulted in an empty response." }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
    
    // --- 5. Return the Successful Response ---
    // If everything is successful, return a 200 OK status with the AI-generated text.
    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
      headers: { 'Content-Type': 'application/json' },
    };

  } catch (apiError) {
    // --- 6. Centralized Error Handling ---
    // This block catches any errors that occur during the `ai.models.generateContent` call.
    console.error("Error during Gemini API call in serverless function:", apiError);

    // Provide a generic, safe error message to the client to avoid leaking implementation details.
    const userMessage = "An unexpected error occurred while communicating with the AI service. The issue has been logged.";
    
    return {
      statusCode: 500, // 500 Internal Server Error
      body: JSON.stringify({ error: userMessage }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};

export { handler };
