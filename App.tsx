
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AssistanceTask } from './types.ts';
import { TASK_PROMPTS } from './constants.ts';
import { analyzeImageWithGemini, API_KEY_PLACEHOLDER } from './services/geminiService.ts';
import { useTextToSpeech } from './hooks/useTextToSpeech.ts';
import { useSpeechRecognition } from './hooks/useSpeechRecognition.ts';
import CameraView, { CameraViewHandles } from './components/CameraView.tsx';
import ActionButton from './components/ActionButton.tsx';
import ApiKeyModal from './components/ApiKeyModal.tsx';

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

const TASK_CONFIG = {
    [AssistanceTask.FIND_BUS]: { Icon: BusIcon },
    [AssistanceTask.CROSS_ROAD]: { Icon: CrosswalkIcon },
    [AssistanceTask.EXPLORE]: { Icon: ExploreIcon },
    [AssistanceTask.FIND_SHOP]: { Icon: ShopIcon },
};

function App() {
  const [isProcessing, setIsProcessing] = useState<AssistanceTask | null>(null);
  const [lastResponse, setLastResponse] = useState<string>('Welcome to UrbanSenseAI. Tap a task or use the voice command button.');
  const [error, setError] = useState<string>('');
  const cameraRef = useRef<CameraViewHandles>(null);
  const { speak, isSpeaking } = useTextToSpeech();
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || API_KEY_PLACEHOLDER);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    if (!apiKey || apiKey === API_KEY_PLACEHOLDER) {
      setIsApiKeyModalOpen(true);
      setLastResponse("Please set your Gemini API key to begin.");
    } else {
      setIsApiKeyModalOpen(false);
    }
  }, [apiKey]);
  
  const handleApiKeySave = (newKey: string) => {
    localStorage.setItem('gemini_api_key', newKey);
    setApiKey(newKey);
    setIsApiKeyModalOpen(false);
    const readyMessage = "API Key saved. Ready to assist.";
    setLastResponse(readyMessage);
    speak(readyMessage);
  };

  const handleTaskSelect = useCallback(async (task: AssistanceTask) => {
    if (isProcessing || isSpeaking || !apiKey || apiKey === API_KEY_PLACEHOLDER) return;

    setError('');
    setIsProcessing(task);
    const analyzingText = `Analyzing for: ${TASK_PROMPTS[task].label}...`;
    setLastResponse(analyzingText);
    speak(analyzingText);

    const base64Image = cameraRef.current?.captureFrame();

    if (!base64Image) {
      const errorMsg = 'Could not capture an image from the camera.';
      setError(errorMsg);
      setLastResponse(errorMsg);
      speak(errorMsg);
      setIsProcessing(null);
      return;
    }

    const prompt = TASK_PROMPTS[task].prompt;
    const result = await analyzeImageWithGemini(base64Image, prompt, apiKey);

    setLastResponse(result);
    speak(result);
    setIsProcessing(null);
  }, [isProcessing, isSpeaking, speak, apiKey]);
  
  const handleCameraError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setLastResponse(errorMessage);
    speak(errorMessage);
  }, [speak]);

  const handleVoiceCommand = useCallback((command: string) => {
    const lowerCaseCommand = command.toLowerCase();
    setLastResponse(`I heard: "${command}"`);

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
      const sorryMsg = "Sorry, I didn't recognize that command. Please say 'find bus', 'cross road', 'explore', or 'find shop'.";
      setLastResponse(sorryMsg);
      speak(sorryMsg);
    }
  }, [handleTaskSelect, speak]);

  const { isListening, error: speechError, startListening } = useSpeechRecognition(handleVoiceCommand);

  useEffect(() => {
    if (speechError) {
      setError(speechError);
      setLastResponse(speechError);
      speak(speechError);
    }
  }, [speechError, speak]);
  
  useEffect(() => {
      if(isListening) {
          setLastResponse("Listening for a command...");
      }
  }, [isListening]);
  
  const isReady = !!apiKey && apiKey !== API_KEY_PLACEHOLDER;
  const anyActionInProgress = !!isProcessing || isSpeaking || isListening || !!error || !isReady;

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col font-sans overflow-hidden">
      {isApiKeyModalOpen && <ApiKeyModal onSave={handleApiKeySave} />}
      <div className="relative flex-grow">
        <CameraView ref={cameraRef} onCameraError={handleCameraError} />
        <div className="absolute top-0 left-0 right-0 p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <h1 className="text-xl font-bold text-center text-teal-300">UrbanSenseAI</h1>
          <p className={`mt-2 text-center text-lg p-3 rounded-lg transition-colors duration-300 ${error ? 'bg-red-800 text-white' : 'bg-transparent'}`}>
            {lastResponse}
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 bg-gray-800 p-4 shadow-inner border-t-2 border-teal-500">
        <div className="flex justify-around items-center gap-2">
          {(Object.keys(TASK_PROMPTS) as AssistanceTask[]).map((task) => (
              <ActionButton
                  key={task}
                  label={TASK_PROMPTS[task].label}
                  onClick={() => handleTaskSelect(task)}
                  disabled={anyActionInProgress}
                  isProcessing={isProcessing === task}
                  Icon={TASK_CONFIG[task].Icon}
              />
          ))}
        </div>
        <div className="mt-6 flex justify-center">
            <button
                onClick={startListening}
                disabled={anyActionInProgress}
                className={`flex items-center justify-center gap-3 w-64 h-20 rounded-full shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:transform-none ${isListening ? 'bg-red-600 animate-pulse' : 'bg-indigo-500'} disabled:bg-gray-600`}
                aria-label="Activate Voice Command"
            >
                <MicrophoneIcon className="w-10 h-10" />
                <span className="text-xl font-bold">{isListening ? 'Listening...' : 'Use Voice'}</span>
            </button>
        </div>
      </div>
    </div>
  );
}

export default App;
