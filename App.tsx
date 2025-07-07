import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AssistanceTask } from './types.ts';
import { TASK_PROMPTS, TASK_LABELS } from './constants.ts';
import { analyzeImageWithGemini } from './services/geminiService.ts';
import { useTextToSpeech } from './hooks/useTextToSpeech.ts';
import { useSpeechRecognition } from './hooks/useSpeechRecognition.ts';
import CameraView, { CameraViewHandles } from './components/CameraView.tsx';
import ActionButton from './components/ActionButton.tsx';
import SettingsModal from './components/SettingsModal.tsx';

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
        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
    </svg>
);

const ShopIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.25 3.75A1.5 1.5 0 0 1 12.75 3h6A1.5 1.5 0 0 1 20.25 4.5v6.5a1.5 1.5 0 0 1-1.5 1.5h-1.5a1.5 1.5 0 0 0-1.5 1.5v3.375a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5V14.25a1.5 1.5 0 0 0-1.5-1.5h-1.5A1.5 1.5 0 0 1 3.75 11V4.5A1.5 1.5 0 0 1 5.25 3h6ZM18.75 6H14.25v5.25h2.25a2.25 2.25 0 0 0 2.25-2.25V6ZM12.75 6H5.25v5.25H9a2.25 2.25 0 0 0 2.25-2.25V6Z" />
    </svg>
);

const MicrophoneIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 18.75a6.75 6.75 0 0 0 6.75-6.75V6.75a6.75 6.75 0 0 0-13.5 0v5.25A6.75 6.75 0 0 0 12 18.75Z" />
        <path d="M4.125 12a.75.75 0 0 0-1.5 0v.345a8.25 8.25 0 0 0 8.25 8.25h.15a8.25 8.25 0 0 0 8.25-8.25V12a.75.75 0 0 0-1.5 0v.345a6.75 6.75 0 0 1-6.75 6.75h-.15a6.75 6.75 0 0 1-6.75-6.75V12Z" />
    </svg>
);

const SettingsIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85c-.09.55-.554.95-1.105.95H4.125a2.25 2.25 0 0 0-2.25 2.25v.82a2.25 2.25 0 0 0 2.25 2.25h3.82a1.125 1.125 0 0 1 1.105.95l.178 2.141a1.875 1.875 0 0 0 1.85 1.567h1.844c.917 0 1.699-.663 1.85-1.567l.178-2.141a1.125 1.125 0 0 1 1.105-.95h3.82a2.25 2.25 0 0 0 2.25-2.25v-.82a2.25 2.25 0 0 0-2.25-2.25h-3.82a1.125 1.125 0 0 1-1.105-.95l-.178-2.141A1.875 1.875 0 0 0 12.922 2.25H11.078ZM12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" clipRule="evenodd" />
    </svg>
);

const TASK_CONFIG = {
    [AssistanceTask.FIND_BUS]: { Icon: BusIcon },
    [AssistanceTask.CROSS_ROAD]: { Icon: CrosswalkIcon },
    [AssistanceTask.EXPLORE]: { Icon: ExploreIcon },
    [AssistanceTask.FIND_SHOP]: { Icon: ShopIcon },
};

export const LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'es-ES', name: 'Spanish' }
];

const UI_STRINGS: Record<string, any> = {
    'en-US': {
        welcome: 'Session started. Tap a task or use the voice command button.',
        analyzing: (label: string) => `Analyzing for: ${label}...`,
        listening: 'Listening for a command...',
        iHeard: (command: string) => `I heard: "${command}"`,
        commandSorry: "Sorry, I didn't recognize that command. Please say 'find bus', 'cross road', 'explore', or 'find shop'.",
        useVoice: "Use Voice",
        listeningButton: "Listening...",
    },
    'hi-IN': {
        welcome: 'सत्र शुरू हो गया है। किसी कार्य पर टैप करें या वॉयस कमांड बटन का उपयोग करें।',
        analyzing: (label: string) => `${label} के लिए विश्लेषण किया जा रहा है...`,
        listening: 'एक कमांड की प्रतीक्षा है...',
        iHeard: (command: string) => `मैंने सुना: "${command}"`,
        commandSorry: "क्षमा करें, मुझे वह आदेश समझ नहीं आया। कृपया 'find bus', 'cross road', 'explore', या 'find shop' कहें।",
        useVoice: "आवाज़ का प्रयोग करें",
        listeningButton: "सुन रहा है...",
    },
    'es-ES': {
        welcome: 'Sesión iniciada. Toque una tarea o use el botón de comando de voz.',
        analyzing: (label: string) => `Analizando para: ${label}...`,
        listening: 'Escuchando un comando...',
        iHeard: (command: string) => `Escuché: "${command}"`,
        commandSorry: "Lo siento, no reconocí ese comando. Por favor, di 'find bus', 'cross road', 'explore', o 'find shop'.",
        useVoice: "Usar Voz",
        listeningButton: "Escuchando...",
    }
};

function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState<AssistanceTask | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [languageIndex, setLanguageIndex] = useState(() => {
    const savedLangIndex = localStorage.getItem('urbanSenseLanguageIndex');
    return savedLangIndex ? parseInt(savedLangIndex, 10) : 0;
  });
  const [isMockMode, setIsMockMode] = useState(() => {
    const savedMockMode = localStorage.getItem('urbanSenseMockMode');
    return savedMockMode ? JSON.parse(savedMockMode) : false;
  });
  
  const currentLang = LANGUAGES[languageIndex];
  const currentStrings = UI_STRINGS[currentLang.code];
  
  const [lastResponse, setLastResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  const cameraRef = useRef<CameraViewHandles>(null);
  const { speak, isSpeaking } = useTextToSpeech();

  const handleStartSession = useCallback(() => {
    setIsSessionActive(true);
    const welcomeMsg = currentStrings.welcome;
    setLastResponse(welcomeMsg);
    speak(welcomeMsg, currentLang.code);
  }, [speak, currentStrings]);
  
  const handleTaskSelect = useCallback(async (task: AssistanceTask) => {
    if (isProcessing || isSpeaking) return;

    setError('');
    setIsProcessing(task);
    const analyzingText = currentStrings.analyzing(TASK_LABELS[currentLang.code][task]);
    setLastResponse(analyzingText);
    speak(analyzingText, currentLang.code);

    const base64Image = cameraRef.current?.captureFrame();

    if (!base64Image && !isMockMode) {
      const errorMsg = 'Could not capture an image from the camera.';
      setError(errorMsg);
      setLastResponse(errorMsg);
      speak(errorMsg, currentLang.code);
      setIsProcessing(null);
      return;
    }

    const prompt = `${TASK_PROMPTS[task].prompt} Please respond in ${currentLang.name}.`;
    const result = await analyzeImageWithGemini(base64Image || '', prompt, task, isMockMode);

    setLastResponse(result);
    speak(result, currentLang.code);
    setIsProcessing(null);
  }, [isProcessing, isSpeaking, speak, currentLang, currentStrings, isMockMode]);
  
  const handleCameraError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setLastResponse(errorMessage);
    speak(errorMessage, currentLang.code);
  }, [speak, currentLang.code]);

  const handleVoiceCommand = useCallback((command: string) => {
    const lowerCaseCommand = command.toLowerCase();
    setLastResponse(currentStrings.iHeard(command));

    let task: AssistanceTask | null = null;
    if (lowerCaseCommand.includes('bus')) {
      task = AssistanceTask.FIND_BUS;
    } else if (lowerCaseCommand.includes('cross') || lowerCaseCommand.includes('road')) {
      task = AssistanceTask.CROSS_ROAD;
    } else if (lowerCaseCommand.includes('explore') || lowerCaseCommand.includes('around')) {
      task = AssistanceTask.EXPLORE;
    } else if (lowerCaseCommand.includes('shop') || lowerCaseCommand.includes('store')) {
      task = AssistanceTask.FIND_SHOP;
    }

    if (task) {
      handleTaskSelect(task);
    } else {
      const sorryMsg = currentStrings.commandSorry;
      setLastResponse(sorryMsg);
      speak(sorryMsg, currentLang.code);
    }
  }, [handleTaskSelect, speak, currentLang, currentStrings]);

  const { isListening, error: speechError, startListening } = useSpeechRecognition(handleVoiceCommand);

  useEffect(() => {
    if (speechError) {
      setError(speechError);
      setLastResponse(speechError);
      speak(speechError, currentLang.code);
    }
  }, [speechError, speak, currentLang.code]);
  
  useEffect(() => {
      if(isListening) {
          setLastResponse(currentStrings.listening);
      }
  }, [isListening, currentStrings]);
  
  const anyActionInProgress = !!isProcessing || isSpeaking || isListening || !!error || isSettingsOpen;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const targetEl = event.target as HTMLElement;
      if (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA') return;
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();
        // Allow voice command immediately if no other action is in progress.
        if (!anyActionInProgress) startListening();
      }
    };
    if (isSessionActive) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [anyActionInProgress, startListening, isSessionActive]);

  const handleLanguageChange = (newLangCode: string) => {
    const newIndex = LANGUAGES.findIndex(l => l.code === newLangCode);
    if (newIndex !== -1 && newIndex !== languageIndex) {
        setLanguageIndex(newIndex);
        localStorage.setItem('urbanSenseLanguageIndex', newIndex.toString());
    }
  };

  const handleMockModeChange = (enabled: boolean) => {
    setIsMockMode(enabled);
    localStorage.setItem('urbanSenseMockMode', JSON.stringify(enabled));
  };

  return (
    <div className="h-dvh w-screen bg-gray-900 text-white relative font-sans overflow-hidden">
      {!isSessionActive ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Start Session. Tap anywhere on the screen to begin."
          onClick={handleStartSession}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleStartSession();
            }
          }}
          className="flex flex-col justify-center items-center h-full w-full cursor-pointer bg-gray-800 text-white focus:outline-none focus:ring-4 focus:ring-teal-400 focus:ring-opacity-75"
        >
          <div className="text-center p-4">
            <h1 className="text-5xl font-extrabold text-teal-300 mb-2">UrbanSenseAI</h1>
            <p className="text-xl text-gray-300 mb-12">Your AI guide for urban navigation.</p>
            <div className="flex justify-center mb-8">
                <div className="p-4 bg-teal-500 rounded-full animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>
            <p className="text-2xl font-semibold">Tap anywhere to start</p>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute inset-0">
            <CameraView ref={cameraRef} onCameraError={handleCameraError} />
          </div>

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            currentLangCode={currentLang.code}
            onLangChange={handleLanguageChange}
            isMockMode={isMockMode}
            onMockModeChange={handleMockModeChange}
          />
          
          <div className="absolute top-0 left-0 right-0 p-4 bg-black bg-opacity-60 backdrop-blur-sm z-10">
            <div className="flex justify-between items-center max-w-4xl mx-auto">
                <div className="w-10"></div>
                <h1 className="text-xl font-bold text-center text-teal-300">UrbanSenseAI</h1>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    disabled={!!isProcessing || isSpeaking || isListening}
                    className="text-white p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-50"
                    aria-label="Open settings"
                >
                    <SettingsIcon className="w-6 h-6" />
                </button>
            </div>
            <p
              className={`mt-2 text-center text-lg p-3 rounded-lg transition-colors duration-300 ${error ? 'bg-red-800 text-white' : 'bg-transparent'}`}
              aria-live="polite"
            >
              {lastResponse}
            </p>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gray-800 p-4 shadow-inner border-t-2 border-teal-500 z-10">
            <div className="flex justify-around items-center gap-2">
              {(Object.keys(TASK_PROMPTS) as AssistanceTask[]).map((task) => (
                  <ActionButton
                      key={task}
                      label={TASK_LABELS[currentLang.code][task]}
                      onClick={() => handleTaskSelect(task)}
                      disabled={anyActionInProgress}
                      isProcessing={isProcessing === task}
                      Icon={TASK_CONFIG[task].Icon}
                  />
              ))}
            </div>
            <div className="mt-6 flex justify-around items-center px-4">
                <button
                    onClick={startListening}
                    disabled={anyActionInProgress}
                    className={`flex items-center justify-center gap-3 w-48 h-20 rounded-full shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:transform-none ${isListening ? 'bg-red-600 animate-pulse' : 'bg-indigo-500'} disabled:bg-gray-600`}
                    aria-label="Activate Voice Command"
                >
                    <MicrophoneIcon className="w-10 h-10" />
                    <span className="text-xl font-bold">{isListening ? currentStrings.listeningButton : currentStrings.useVoice}</span>
                </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
