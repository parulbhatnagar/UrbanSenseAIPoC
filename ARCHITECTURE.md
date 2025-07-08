# UrbanSenseAI System Architecture

This document provides a high-level overview of the UrbanSenseAI application's architecture. It is intended for developers who want to understand how the system is structured, how data flows, and the rationale behind key design decisions.

## 1. System Overview

UrbanSenseAI is a Progressive Web App (PWA) that assists visually impaired users by providing real-time audio descriptions of their surroundings. It uses the device's camera and combines it with the Google Gemini AI for analysis.

The architecture is split into two main parts:
1.  **Frontend (Client-Side)**: A React application that runs in the user's browser. It handles the user interface, camera access, device sensors (GPS), and all user interactions.
2.  **Backend (Serverless Function)**: A Netlify serverless function that acts as a secure proxy to the Google Gemini API. This is only used in the production environment.

---

## 2. Data Flow & System Diagram

The primary data flow for a user request follows these steps:

1.  **User Action**: The user selects a task (e.g., "Find Bus") by tapping a button.
2.  **Camera Capture**: The React app captures a still frame from the live camera feed.
3.  **Data Aggregation**: The app bundles the image, the relevant AI prompt, and the user's current GPS coordinates.
4.  **API Request**:
    *   **In Development**: The request is sent directly from the browser to the Gemini API using a local API key.
    *   **In Production**: The request is sent to our secure Netlify serverless function. The serverless function then calls the Gemini API using an environment variable, hiding the key from the public.
5.  **AI Analysis**: The Gemini model processes the image and prompt and returns a descriptive text.
6.  **Response Handling**: The app receives the text response from the API.
7.  **Audio Feedback**: The app uses the browser's built-in text-to-speech engine to read the response aloud to the user in their selected language.

Here is a simplified diagram of the production flow:

```
+-------------+      (1. Selects Task)      +-------------------+      (4. Capture, GPS, Prompt)     +--------------------------+
|             | ------------------------>   |                   | ---------------------------------> |                          |
|    User     |                             |   React Frontend  |                                    | Netlify Serverless Func. |
|             | <------------------------   |  (in Browser)     | <--------------------------------- |      (Secure Proxy)      |
+-------------+   (7. Audio Feedback)       |                   |      (6. AI Response Text)         |                          |
                                            +-------------------+                                    +-------------+------------+
                                                                                                                   | (5. API Call w/ Key)
                                                                                                                   |
                                                                                                                   v
                                                                                                        +---------------------+
                                                                                                        | Google Gemini API   |
                                                                                                        +---------------------+
```

---

## 3. Frontend Architecture

The frontend is built with React, Vite, and TypeScript.

### Key Components (`components/`)
- **`App.tsx`**: The root component. It orchestrates the entire application, manages global state, and brings all the pieces (camera, hooks, buttons) together.
- **`CameraView.tsx`**: Responsible for accessing the device's rear-facing camera using `navigator.mediaDevices.getUserMedia` and providing a function to capture a frame.
- **`ActionButton.tsx`**: A reusable button for the main tasks. It shows a loading spinner and handles disabled states.
- **`SettingsModal.tsx`**: A modal dialog for changing settings like language and mock mode.

### Custom Hooks (`hooks/`)
Hooks are used to encapsulate complex logic and interaction with browser APIs.
- **`useTextToSpeech.ts`**: Wraps the `SpeechSynthesis` Web API. It manages the speaking state and intelligently selects the correct voice for the chosen language.
- **`useSpeechRecognition.ts`**: Wraps the `SpeechRecognition` Web API. It manages the listening state and handles incoming voice commands.
- **`useLocation.ts`**: Wraps the `Geolocation` API. It handles requesting location permissions and fetching the user's GPS coordinates.

### Services (`services/`)
- **`geminiService.ts`**: This is a critical file for abstracting away the Gemini API calls. It contains the logic to differentiate between development and production environments using `import.meta.env.DEV`. This ensures the local API key (`VITE_API_KEY`) is *never* included in the production build, preventing security leaks.

### State Management
The application uses React's `useState` and `useRef` for state management. Global UI state (like `isProcessing`, `isSpeaking`, `isListening`) is managed in the main `App.tsx` component and passed down as props. This centralized approach prevents conflicts, such as trying to speak and listen at the same time. The `statusMessage` state provides direct feedback to the user about what the app is doing.

---

## 4. Backend Architecture (Serverless)

The backend consists of a single serverless function: `netlify/functions/analyzeImage.ts`.

- **Purpose**: To act as a secure proxy between the production frontend and the Google Gemini API.
- **Security**: The function retrieves the `API_KEY` from Netlify's secure environment variables. This key is never exposed to the user's browser.
- **Concurrency**: The Gemini AI client is initialized *outside* the main handler function. This is a best practice for serverless environments as it allows the function to reuse the client instance across multiple "warm" invocations, improving performance and reducing latency for concurrent users. The function itself is stateless and non-blocking, making it highly scalable.
- **Error Handling**: It includes robust validation and error handling to gracefully manage invalid requests or API failures.

---

## 5. PWA & Offline Capability (`sw.js`, `manifest.json`)

The application is a Progressive Web App, which means:
- **Installable**: Users can add it to their home screen for an app-like experience.
- **Offline First**: The service worker (`sw.js`) uses a "cache-first" strategy. It caches the main app shell (HTML, CSS, JS). When a user opens the app, it loads instantly from the cache, even without an internet connection. Network requests for data (like API calls) will naturally fail if offline, and the app's error handling will manage this.
