/**
 * @file useTextToSpeech.ts
 * This custom React hook encapsulates the logic for using the browser's Web Speech API
 * for text-to-speech (TTS) synthesis. It provides a simple `speak` function and tracks
 * the speaking state.
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * A custom hook to provide text-to-speech functionality.
 * @returns An object containing the `speak` function and an `isSpeaking` boolean flag.
 */
export const useTextToSpeech = () => {
  // State to track if the browser is currently speaking.
  const [isSpeaking, setIsSpeaking] = useState(false);
  // State to store the list of available voices on the device.
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // The list of voices is loaded asynchronously by the browser. We need to listen for the
  // 'voiceschanged' event to know when they are ready.
  useEffect(() => {
    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // The 'voiceschanged' event fires when the voice list has been loaded and is ready.
    window.speechSynthesis.onvoiceschanged = updateVoices;

    // We also call it once initially, in case the voices are already loaded.
    updateVoices();

    // Cleanup: remove the event listener when the component that uses this hook unmounts.
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  /**
   * Speaks the given text using the specified language.
   * @param text The string of text to be spoken.
   * @param lang The language code (e.g., 'en-US', 'hi-IN') for voice selection.
   * @returns A Promise that resolves when the speech is finished or canceled, and rejects on error.
   */
  const speak = useCallback((text: string, lang: string = 'en-US'): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Guard clause: Ensure the browser supports speech synthesis and text is provided.
        if (!window.speechSynthesis || !text) {
          const errorMsg = "Speech synthesis not supported or no text provided.";
          console.error(errorMsg);
          reject(new Error(errorMsg));
          return;
        }

        // Always cancel any ongoing speech before starting a new one.
        // This prevents multiple speech requests from queuing up and ensures immediate feedback.
        window.speechSynthesis.cancel();

        // Create a new utterance object.
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;

        // --- Intelligent Voice Selection ---
        // Find the best available voice for the requested language.
        // First, try for an exact match (e.g., 'en-US').
        let voice = voices.find(v => v.lang === lang);
        if (!voice) {
          // If no exact match, try for a partial match on the primary language (e.g., 'en').
          // This helps on devices that may have 'en-GB' but not 'en-US'.
          const langPrefix = lang.split('-')[0];
          voice = voices.find(v => v.lang.startsWith(langPrefix));
        }
        
        if (voice) {
          utterance.voice = voice;
        } else if (voices.length > 0) {
          // If no specific voice is found, log a warning and let the browser use its default.
          console.warn(`No specific voice found for language '${lang}'. The browser will use its default.`);
        }
        
        // --- Event Handlers for the Utterance ---
        utterance.onstart = () => setIsSpeaking(true);
        
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve(); // Resolve the promise when speech successfully finishes.
        };

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          // 'interrupted' is an expected error if we call `cancel()` ourselves, so it's not a true error.
          if (event.error !== 'interrupted') {
            console.error(`SpeechSynthesisUtterance.onerror - error: ${event.error}`, event);
            reject(new Error(`Speech synthesis error: ${event.error}`));
          } else {
            resolve(); // If interrupted, the "speech" is considered over, so we resolve.
          }
          setIsSpeaking(false);
        };
        
        // Finally, tell the browser to speak the utterance.
        window.speechSynthesis.speak(utterance);
    });
  }, [voices]); // This function depends on the list of voices, so it's recreated if `voices` changes.
  
  // A final cleanup effect to cancel any speech if the component unmounts unexpectedly.
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { speak, isSpeaking };
};
