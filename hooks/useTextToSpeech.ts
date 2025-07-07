import { useState, useCallback, useEffect } from 'react';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // The list of voices is loaded asynchronously. We need to listen for the 'voiceschanged' event.
  useEffect(() => {
    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // The event fires when the voice list has been loaded and is ready.
    window.speechSynthesis.onvoiceschanged = updateVoices;

    // Call it once to try and get the voices initially, in case they are already loaded.
    updateVoices();

    // Cleanup listener on unmount.
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string, lang: string = 'en-US') => {
    if (!window.speechSynthesis || !text) {
      console.error("Speech synthesis not supported or no text provided.");
      return;
    }

    // Always cancel any ongoing speech before starting a new one.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    // Find the best available voice for the requested language.
    // This is crucial for non-English languages on mobile devices.
    // 1. Try for an exact language-region match (e.g., 'es-ES')
    let voice = voices.find(v => v.lang === lang);
    // 2. If no exact match, try for a partial match on the language (e.g., 'es' for 'es-ES')
    if (!voice) {
      const langPrefix = lang.split('-')[0];
      voice = voices.find(v => v.lang.startsWith(langPrefix));
    }
    
    if (voice) {
      utterance.voice = voice;
    } else if (voices.length > 0) {
      // This is a warning, not an error. The browser will attempt to use its default voice for the lang.
      console.warn(`No specific voice found for language '${lang}'. The browser will use its default.`);
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      if (event.error === 'interrupted') {
        // This is normal behavior when we cancel speech; no need to log it.
      } else {
        console.error(`SpeechSynthesisUtterance.onerror - error: ${event.error}`, event);
      }
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [voices]); // We now depend on 'voices' so the correct voice is used when the list loads.
  
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
