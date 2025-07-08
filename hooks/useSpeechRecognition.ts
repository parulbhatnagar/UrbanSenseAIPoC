/**
 * @file useSpeechRecognition.ts
 * This custom React hook encapsulates the logic for using the browser's Web Speech API
 * for speech-to-text recognition. It provides a simple `startListening` function and
 * tracks the listening state and any errors.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Define the interface for the SpeechRecognition API to support vendor prefixes (like `webkitSpeechRecognition`).
// This makes our code more robust across different browsers.
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onstart: () => void;
  onend: () => void;
}

// Get the correct SpeechRecognition object from the window, accounting for the `webkit` prefix used by Chrome and other browsers.
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

/**
 * A custom hook to provide speech recognition functionality.
 * @param onResult A callback function that will be invoked with the transcribed text when recognition is successful.
 * @returns An object containing `isListening` and `error` state, and a `startListening` function.
 */
export const useSpeechRecognition = (onResult: (transcript: string) => void) => {
  // State to track if the browser is currently listening for speech.
  const [isListening, setIsListening] = useState(false);
  // State to store any error messages.
  const [error, setError] = useState<string | null>(null);
  // A ref to hold the single instance of the SpeechRecognition object.
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // This effect runs once on component mount to initialize the speech recognition engine.
  useEffect(() => {
    // If the browser doesn't support SpeechRecognition, set an error and do nothing else.
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;     // We want to stop listening after the user finishes speaking a single phrase.
    recognition.interimResults = false; // We only want final, confident results, not partial ones.
    
    // --- Event Handlers for the Recognition Instance ---
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== 'aborted') {
        // Provide a user-friendly error message. 'not-allowed' is common if microphone permission is denied.
        setError(`Speech recognition error: ${event.error}. Please ensure microphone access is granted.`);
      }
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      // Extract the transcript from the event object.
      const transcript = event.results[0][0].transcript;
      // Pass the result to the callback function provided by the parent component.
      onResult(transcript);
      setIsListening(false);
    };

    // Store the created instance in our ref for later use.
    recognitionRef.current = recognition;

    // Cleanup function: This is called when the component that uses this hook unmounts.
    // It ensures that we stop listening to prevent memory leaks.
    return () => {
        if(recognitionRef.current) {
            recognitionRef.current.abort(); // Use abort to prevent onend from being called unnecessarily
        }
    }
  }, [onResult]); // This effect depends on `onResult`, so it's recreated if that callback changes.

  /**
   * A memoized function to start the speech recognition process for a specific language.
   * @param lang The language code (e.g., 'en-US', 'hi-IN') for recognition.
   */
  const startListening = useCallback((lang: string = 'en-US') => {
    // Don't start if we're already listening or if the recognition object isn't initialized.
    if (isListening || !recognitionRef.current) {
      return;
    }
    try {
        // Set the correct language for this listening session.
        recognitionRef.current.lang = lang;
        console.log(`Starting speech recognition for language: ${lang}`);
        recognitionRef.current.start();
    } catch(e) {
        console.error("Could not start listening", e);
        setError("Could not start recognition. Is another instance running?");
        setIsListening(false);
    }
  }, [isListening]); // This function depends on the `isListening` state.

  return { isListening, error, startListening };
};
