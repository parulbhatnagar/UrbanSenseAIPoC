/**
 * @file App.tsx
 * This is the main root component of the UrbanSenseAI application.
 * It orchestrates all the major parts of the app, including:
 * - Managing the overall application state (e.g., loading, speaking, listening).
 * - Integrating custom hooks for camera, location, text-to-speech, and speech-recognition.
 * - Handling user interactions and triggering AI analysis.
 * - Rendering the main UI components like the camera view, action buttons, and settings.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AssistanceTask } from './types.ts';
import { TASK_PROMPTS, TASK_LABELS } from './constants.ts';
import { analyzeImageWithGemini } from './services/geminiService.ts';
import { useTextToSpeech } from './hooks/useTextToSpeech.ts';
import { useSpeechRecognition } from './hooks/useSpeechRecognition.ts';
import { useLocation } from './hooks/useLocation.ts';
import CameraView, { CameraViewHandles } from './components/CameraView.tsx';
import ActionButton from './components/ActionButton.tsx';
import SettingsModal from './components/SettingsModal.tsx';

// --- SVG Icon Components --- //
// These are simple, self-contained functional components that render SVG icons.
// They accept a `className` prop to allow for flexible styling via Tailwind CSS.

const BusIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 7.37a1 1 0 0 0-.9-.37H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h.5a1.5 1.5 0 0 0 3 0h6a1.5 1.5 0 0 0 3 0h.5a1 1 0 0 0 1-1v-8a1 1 0 0 0-.1-.63ZM8 17.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm8 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM18 14H6V8h12Z" />
        <path d="M11 9h2v4h-2z"/>
    </svg>
);

const CrosswalkIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.25 2.25a.75.75 0 0 0-1.5 0v1.432l-3.324 3.99a.75.75 0 0 0 .574 1.203h1.25V12h-1.25a.75.75 0 0 0-.574 1.204l3.324 3.99v1.431a.75.75 0 0 0 1.5 0v-1.432l3.324-3.99a.75.75 0 0 0-.574-1.203h-1.25V8.825h1.25a.75.75 0 0 0 .574-1.204l-3.324-3.99V2.25ZM9.75 12h4.5V8.825H9.75V12Z" />
    </svg>
);

const ExploreIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
);

const ShopIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4L3 12v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/>
    </svg>
);

const SettingsIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17-.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22-.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
    </svg>
);


// --- Language & UI String Definitions --- //
// This data structure holds all localizable content for the app.
export const LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
  { code: 'es-ES', name: 'Español (Spanish)' },
];

const UI_STRINGS: Record<string, { [key: string]: string }> = {
    'en-US': {
        'status_initializing': "Initializing...",
        'status_ready': "Ready. Select a task.",
        'status_processing': "Analyzing...",
        'status_location': "Acquiring location...",
        'status_listening': "Listening...",
        'shop_prompt': "What kind of shop are you looking for?",
    },
    'hi-IN': {
        'status_initializing': "शुरू हो रहा है...",
        'status_ready': "तैयार। एक कार्य चुनें।",
        'status_processing': "विश्लेषण हो रहा है...",
        'status_location': "स्थान प्राप्त हो रहा है...",
        'status_listening': "सुन रहा है...",
        'shop_prompt': "आप किस तरह की दुकान ढूंढ रहे हैं?",
    },
    'es-ES': {
        'status_initializing': "Inicializando...",
        'status_ready': "Listo. Seleccione una tarea.",
        'status_processing': "Analizando...",
        'status_location': "Adquiriendo ubicación...",
        'status_listening': "Escuchando...",
        'shop_prompt': "¿Qué tipo de tienda estás buscando?",
    }
};


const App: React.FC = () => {
    // --- State Management ---
    // Tracks which task is currently being processed (or null if none).
    const [isProcessing, setIsProcessing] = useState<AssistanceTask | null>(null);
    // The message displayed in the status bar at the top of the screen.
    const [statusMessage, setStatusMessage] = useState(UI_STRINGS['en-US']['status_initializing']);
    // Controls the visibility of the settings modal.
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    // The currently selected language code for UI text and speech.
    const [currentLangCode, setCurrentLangCode] = useState('en-US');
    // Toggles between using real AI and mock responses for testing.
    const [isMockMode, setIsMockMode] = useState(false);
    // Stores any error message related to the camera.
    const [cameraError, setCameraError] = useState<string | null>(null);
    
    // --- Refs ---
    // A ref to the CameraView component instance to call its `captureFrame` method.
    const cameraRef = useRef<CameraViewHandles>(null);
    // A ref to store which task triggered a speech recognition request (e.g., FIND_SHOP).
    const activeTaskRef = useRef<AssistanceTask | null>(null);

    // --- Custom Hooks ---
    const { speak, isSpeaking } = useTextToSpeech();
    const { location, error: locationError, isRequesting: isRequestingLocation, requestLocation } = useLocation();

    /**
     * The main function to perform AI analysis.
     * It captures an image, constructs the correct prompt, and calls the Gemini service.
     */
    const runAnalysis = useCallback(async (task: AssistanceTask, userQuery: string | null = null) => {
        if (!cameraRef.current) return;
        
        setStatusMessage(UI_STRINGS[currentLangCode]['status_processing']);
        setIsProcessing(task);
        
        const base64Image = cameraRef.current.captureFrame();
        if (!base64Image) {
            const errorMsg = "Failed to capture image.";
            setStatusMessage(errorMsg);
            speak(errorMsg, currentLangCode);
            setIsProcessing(null);
            return;
        }

        // Construct the final prompt.
        let prompt = TASK_PROMPTS[task].prompt;
        // Append a user query if provided (for FIND_SHOP task).
        if (task === AssistanceTask.FIND_SHOP && userQuery) {
            prompt += ` The user is looking for: "${userQuery}".`;
        }
        // Append GPS coordinates if available for better contextual awareness.
        if (location) {
            prompt += ` Current GPS coordinates are Latitude: ${location.latitude}, Longitude: ${location.longitude}.`;
        }

        // Call the Gemini service.
        const result = await analyzeImageWithGemini(base64Image, prompt, task, isMockMode);
        
        // Update the UI and speak the result.
        setStatusMessage(result);
        await speak(result, currentLangCode);
        
        // Reset the processing state.
        setIsProcessing(null);
    }, [currentLangCode, location, isMockMode, speak]);

    /**
     * A callback function that is passed to the useSpeechRecognition hook.
     * It is executed when the browser has successfully recognized speech.
     */
    const handleSpeechResult = useCallback((transcript: string) => {
        // Check which task was active when listening started.
        if (activeTaskRef.current) {
            // Run analysis for that task with the user's spoken query.
            runAnalysis(activeTaskRef.current, transcript);
            activeTaskRef.current = null; // Clear the active task ref.
        }
    }, [runAnalysis]);
    
    // Initialize the speech recognition hook.
    const { isListening, error: speechError, startListening } = useSpeechRecognition(handleSpeechResult);

    /**
     * Handles clicks on the main action buttons.
     */
    const handleTaskClick = useCallback(async (task: AssistanceTask) => {
        // Prevent new actions while one is already in progress.
        if (isProcessing || isSpeaking || isListening) return;

        // The "Find Shop" task has a special two-step interactive flow.
        if (task === AssistanceTask.FIND_SHOP) {
            activeTaskRef.current = task; // Set the active task.
            const shopPrompt = UI_STRINGS[currentLangCode]['shop_prompt'];
            setStatusMessage(shopPrompt);
            try {
              // First, ask the user what they are looking for.
              await speak(shopPrompt, currentLangCode);
              // THEN, start listening for their response. `await` is crucial here.
              startListening();
            } catch (e) {
              const errorMsg = e instanceof Error ? e.message : "An unknown error occurred during speech.";
              setStatusMessage(errorMsg);
            }
        } else {
            // For all other tasks, run analysis directly.
            runAnalysis(task);
        }
    }, [isProcessing, isSpeaking, isListening, currentLangCode, speak, startListening, runAnalysis]);

    // --- useEffect Hooks for Side Effects ---

    // On initial mount, request the user's location.
    useEffect(() => {
        requestLocation();
    }, [requestLocation]);

    // This effect centralizes error handling from various hooks.
    useEffect(() => {
        const error = cameraError || locationError || speechError;
        if (error) {
            setStatusMessage(error);
            speak(error, currentLangCode);
        }
    }, [cameraError, locationError, speechError, speak, currentLangCode]);

     // This effect updates the status message based on the app's current state.
     useEffect(() => {
        const lang = currentLangCode as keyof typeof UI_STRINGS;
        if (isRequestingLocation) {
             setStatusMessage(UI_STRINGS[lang]['status_location']);
        } else if (isListening) {
            setStatusMessage(UI_STRINGS[lang]['status_listening']);
        } else if (!isProcessing && !isSpeaking) {
             // If nothing else is happening, show the "Ready" message.
             setStatusMessage(UI_STRINGS[lang]['status_ready']);
        }
    }, [isRequestingLocation, isListening, isProcessing, isSpeaking, currentLangCode]);

    // --- Render Logic ---

    // Define the configuration for the four main action buttons.
    const taskButtons = [
        { task: AssistanceTask.FIND_BUS, Icon: BusIcon },
        { task: AssistanceTask.CROSS_ROAD, Icon: CrosswalkIcon },
        { task: AssistanceTask.EXPLORE, Icon: ExploreIcon },
        { task: AssistanceTask.FIND_SHOP, Icon: ShopIcon }
    ];
    
    return (
        <div className="relative w-screen h-screen font-sans bg-black">
            {/* The live camera feed takes up the background. */}
            <CameraView ref={cameraRef} onCameraError={setCameraError} />
            
            {/* Status & Error Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-black bg-opacity-50 text-center z-10">
                <p className="text-lg font-medium" aria-live="polite">
                    {statusMessage}
                </p>
            </div>
            
            {/* Main Action Grid */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                    {taskButtons.map(({ task, Icon }) => (
                        <ActionButton
                            key={task}
                            label={TASK_LABELS[currentLangCode as keyof typeof TASK_LABELS][task]}
                            onClick={() => handleTaskClick(task)}
                            // Disable buttons if any action is happening anywhere in the app, or if the camera failed.
                            disabled={isProcessing !== null || isSpeaking || isListening || !!cameraError}
                            // Show spinner only on the button that is currently processing.
                            isProcessing={isProcessing === task}
                            Icon={Icon}
                        />
                    ))}
                </div>
            </div>

            {/* Settings Button */}
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="absolute top-4 right-4 z-30 p-3 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Settings"
            >
                <SettingsIcon className="w-6 h-6" />
            </button>
            
            {/* The settings modal, which is conditionally rendered. */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentLangCode={currentLangCode}
                onLangChange={setCurrentLangCode}
                isMockMode={isMockMode}
                onMockModeChange={setIsMockMode}
            />
        </div>
    );
};

export default App;
