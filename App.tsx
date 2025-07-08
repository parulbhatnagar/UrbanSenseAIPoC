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
import { TASK_PROMPTS, TASK_LABELS, VOICE_COMMANDS } from './constants.ts';
import { analyzeImageWithGemini } from './services/geminiService.ts';
import { useTextToSpeech } from './hooks/useTextToSpeech.ts';
import { useSpeechRecognition } from './hooks/useSpeechRecognition.ts';
import { useLocation } from './hooks/useLocation.ts';
import CameraView, { CameraViewHandles } from './components/CameraView.tsx';
import SettingsModal from './components/SettingsModal.tsx';

// --- SVG Icon Components --- //
// These are simple, self-contained functional components that render SVG icons.
// They accept a `className` prop to allow for flexible styling via Tailwind CSS.
const SettingsIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17-.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59-1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22-.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
    </svg>
);

const MicrophoneIcon: React.FC<{ className: string, isListening: boolean }> = ({ className, isListening }) => (
    <div className={`relative ${className}`}>
        {isListening && (
            <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping"></div>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" className="relative w-full h-full" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
        </svg>
    </div>
);

// --- Language & UI String Definitions --- //
export const LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
  { code: 'es-ES', name: 'Español (Spanish)' },
];

const UI_STRINGS: Record<string, { [key: string]: string }> = {
    'en-US': {
        'status_initializing': "Initializing... Please wait.",
        'status_ready': "Tap the microphone and say a command.",
        'status_processing': "Analyzing...",
        'status_location': "Acquiri_location...",
        'status_listening': "Listening...",
        'shop_prompt': "What kind of shop are you looking for?",
        'command_unrecognized': "Sorry, I didn't understand that. Please try again.",
        'welcome': "Welcome to Urban Sense. Tap the microphone to begin."
    },
    'hi-IN': {
        'status_initializing': "शुरू हो रहा है... कृपया प्रतीक्षा करें।",
        'status_ready': "माइक्रोफ़ोन टैप करें और कमांड बोलें।",
        'status_processing': "विश्लेषण हो रहा है...",
        'status_location': "स्थान प्राप्त हो रहा है...",
        'status_listening': "सुन रहा है...",
        'shop_prompt': "आप किस तरह की दुकान ढूंढ रहे हैं?",
        'command_unrecognized': "माफ़ कीजिए, मुझे समझ नहीं आया। कृपया फिर से प्रयास करें।",
        'welcome': "अर्बन सेंस में आपका स्वागत है। शुरू करने के लिए माइक्रोफ़ोन टैप करें।"
    },
    'es-ES': {
        'status_initializing': "Inicializando... Por favor, espere.",
        'status_ready': "Pulse el micrófono y diga un comando.",
        'status_processing': "Analizando...",
        'status_location': "Adquiriendo ubicación...",
        'status_listening': "Escuchando...",
        'shop_prompt': "¿Qué tipo de tienda estás buscando?",
        'command_unrecognized': "Lo siento, no he entendido. Por favor, inténtelo de nuevo.",
        'welcome': "Bienvenido a Urban Sense. Pulse el micrófono para comenzar."
    }
};

const App: React.FC = () => {
    // --- State Management ---
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState(UI_STRINGS['en-US']['status_initializing']);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [currentLangCode, setCurrentLangCode] = useState('en-US');
    const [isMockMode, setIsMockMode] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [hasInitialized, setHasInitialized] = useState(false);
    
    // --- Refs ---
    const cameraRef = useRef<CameraViewHandles>(null);
    const activeTaskRef = useRef<'COMMAND' | AssistanceTask | null>(null);

    // --- Custom Hooks ---
    const { speak, isSpeaking } = useTextToSpeech();
    const { location, error: locationError, isRequesting: isRequestingLocation, requestLocation } = useLocation();

    /**
     * The main function to perform AI analysis.
     */
    const runAnalysis = useCallback(async (task: AssistanceTask, userQuery: string | null = null) => {
        if (!cameraRef.current) return;
        
        setStatusMessage(UI_STRINGS[currentLangCode]['status_processing']);
        setIsProcessing(true);
        
        const base64Image = cameraRef.current.captureFrame();
        if (!base64Image) {
            const errorMsg = "Failed to capture image.";
            setStatusMessage(errorMsg);
            speak(errorMsg, currentLangCode);
            setIsProcessing(false);
            return;
        }

        let prompt = TASK_PROMPTS[task].prompt;
        if (task === AssistanceTask.FIND_SHOP && userQuery) {
            prompt += ` The user is specifically looking for: "${userQuery}".`;
        }
        if (location) {
            prompt += ` Current GPS coordinates are Latitude: ${location.latitude}, Longitude: ${location.longitude}.`;
        }

        const result = await analyzeImageWithGemini(base64Image, prompt, task, isMockMode);
        
        setStatusMessage(result);
        await speak(result, currentLangCode);
        
        setIsProcessing(false);
    }, [currentLangCode, location, isMockMode, speak]);

    /**
     * Finds the corresponding task for a given voice command in the current language.
     */
    const findTaskForCommand = (transcript: string, lang: string): AssistanceTask | null => {
        const commands = VOICE_COMMANDS[lang] || VOICE_COMMANDS['en-US'];
        const normalizedTranscript = transcript.toLowerCase().trim();
        return commands[normalizedTranscript] || null;
    };

    /**
     * Callback executed when the browser has successfully recognized speech.
     */
    const handleSpeechResult = useCallback(async (transcript: string) => {
        console.log(`Recognized speech: "${transcript}" | Active Task: ${activeTaskRef.current}`);
        
        // Case 1: We were listening for the answer to the "Find Shop" question.
        if (activeTaskRef.current === AssistanceTask.FIND_SHOP) {
            runAnalysis(AssistanceTask.FIND_SHOP, transcript);
            activeTaskRef.current = null;
            return;
        }

        // Case 2: We were listening for a general command.
        const task = findTaskForCommand(transcript, currentLangCode);

        if (!task) {
            const unrecognizedMsg = UI_STRINGS[currentLangCode]['command_unrecognized'];
            setStatusMessage(unrecognizedMsg);
            await speak(unrecognizedMsg, currentLangCode);
            return;
        }
        
        // Special flow for FIND_SHOP
        if (task === AssistanceTask.FIND_SHOP) {
            activeTaskRef.current = AssistanceTask.FIND_SHOP;
            const shopPrompt = UI_STRINGS[currentLangCode]['shop_prompt'];
            setStatusMessage(shopPrompt);
            try {
                await speak(shopPrompt, currentLangCode);
                // After speaking, immediately start listening for the user's answer.
                startListening(currentLangCode);
            } catch (e) {
                const errorMsg = e instanceof Error ? e.message : "An unknown error occurred during speech.";
                setStatusMessage(errorMsg);
            }
        } else {
            // For all other tasks, run analysis directly.
            runAnalysis(task);
        }
    }, [runAnalysis, currentLangCode, speak]);
    
    const { isListening, error: speechError, startListening } = useSpeechRecognition(handleSpeechResult);

    /**
     * Handles the click on the main microphone button.
     */
    const handleMicClick = useCallback(() => {
        // Prevent starting a new action if anything is already in progress.
        if (isProcessing || isSpeaking || isListening || !hasInitialized) return;
        
        activeTaskRef.current = 'COMMAND';
        startListening(currentLangCode);

    }, [isProcessing, isSpeaking, isListening, hasInitialized, currentLangCode, startListening]);


    // --- useEffect Hooks for Side Effects ---

    // On initial mount, request location and speak a welcome message once ready.
    useEffect(() => {
        requestLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        let newStatus = statusMessage;

        if (isRequestingLocation) newStatus = UI_STRINGS[lang]['status_location'];
        else if (isListening) newStatus = UI_STRINGS[lang]['status_listening'];
        else if (isProcessing) newStatus = UI_STRINGS[lang]['status_processing'];
        else if (!isSpeaking && hasInitialized) newStatus = UI_STRINGS[lang]['status_ready'];
        
        setStatusMessage(newStatus);
        // We only want to react to state changes, not the status message itself.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRequestingLocation, isListening, isProcessing, isSpeaking, hasInitialized, currentLangCode]);
    
    // Once location is acquired and app is ready, speak the welcome message.
    useEffect(() => {
        if (!isRequestingLocation && !hasInitialized) {
            setHasInitialized(true);
            const welcomeMsg = UI_STRINGS[currentLangCode]['welcome'];
            setStatusMessage(welcomeMsg);
            speak(welcomeMsg, currentLangCode);
        }
    }, [isRequestingLocation, hasInitialized, speak, currentLangCode]);
    
    // --- Render Logic ---
    const isAppBusy = isProcessing || isSpeaking || isListening || !hasInitialized;
    
    return (
        <div className="relative w-screen h-screen font-sans bg-black" onClick={handleMicClick}>
            <CameraView ref={cameraRef} onCameraError={setCameraError} />
            
            <div className="absolute top-0 left-0 right-0 p-4 bg-black bg-opacity-60 text-center z-10">
                <p className="text-lg font-medium" aria-live="polite">
                    {statusMessage}
                </p>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col items-center">
                 <button
                    onClick={handleMicClick}
                    disabled={isAppBusy}
                    className="w-28 h-28 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-2xl transform transition-transform focus:outline-none focus:ring-4 focus:ring-teal-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none active:scale-95"
                    aria-label="Start voice command"
                >
                    <MicrophoneIcon className="w-16 h-16" isListening={isListening} />
                </button>
                <div className="text-center mt-4 text-gray-300 text-sm">
                    <p>Suggested commands:</p>
                    <p className="font-mono">{Object.values(TASK_LABELS[currentLangCode]).join(' | ')}</p>
                </div>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(true); }}
                className="absolute top-4 right-4 z-30 p-3 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Settings"
            >
                <SettingsIcon className="w-6 h-6" />
            </button>
            
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
