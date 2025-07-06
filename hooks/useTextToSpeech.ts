import { useState, useCallback, useEffect } from 'react';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string, lang: string = 'en-US') => {
    if (!window.speechSynthesis || !text) {
      console.error("Speech synthesis not supported or no text provided.");
      return;
    }

    // Always cancel any ongoing speech before starting a new one.
    // This is crucial for responsiveness and the source of the 'interrupted' error.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang; // Set the language for the utterance
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      // The 'interrupted' error is expected when we call `cancel()` before `speak()`.
      // It's not a true error, so we can safely ignore it to avoid console spam.
      if (event.error === 'interrupted') {
        // This is normal behavior, no need to log it as an error.
      } else {
        console.error(`SpeechSynthesisUtterance.onerror - error: ${event.error}`, event);
      }
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  }, []);
  
  // Cleanup effect to cancel speech when the component unmounts.
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { speak, isSpeaking };
};
