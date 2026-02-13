import { createContext, useState, useEffect, useContext, useCallback } from 'react';

export const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  // Font size state - maps to CSS font-size percentage
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('accessibility-font-size');
    return saved || 'medium';
  });

  // Text-to-Speech enabled state
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    const saved = localStorage.getItem('accessibility-tts-enabled');
    return saved === 'true';
  });

  // Speech rate state
  const [speechRate, setSpeechRate] = useState(() => {
    const saved = localStorage.getItem('accessibility-speech-rate');
    return saved || 'normal';
  });

  // High contrast mode
  const [highContrast, setHighContrast] = useState(() => {
    const saved = localStorage.getItem('accessibility-high-contrast');
    return saved === 'true';
  });

  // Reduce motion
  const [reduceMotion, setReduceMotion] = useState(() => {
    const saved = localStorage.getItem('accessibility-reduce-motion');
    return saved === 'true';
  });

  // Screen reader support
  const [screenReaderSupport, setScreenReaderSupport] = useState(() => {
    const saved = localStorage.getItem('accessibility-screen-reader');
    return saved !== 'false'; // Default true
  });

  // Font size mapping to CSS values
  const fontSizeMap = {
    small: '14px',
    medium: '16px',
    large: '18px',
    'extra-large': '20px'
  };

  // Apply font size to document
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = fontSizeMap[fontSize] || '16px';
    localStorage.setItem('accessibility-font-size', fontSize);
  }, [fontSize]);

  // Apply high contrast mode
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility-high-contrast', highContrast);
  }, [highContrast]);

  // Apply reduce motion
  useEffect(() => {
    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    localStorage.setItem('accessibility-reduce-motion', reduceMotion);
  }, [reduceMotion]);

  // Apply screen reader support
  useEffect(() => {
    if (screenReaderSupport) {
      document.documentElement.classList.add('screen-reader-support');
    } else {
      document.documentElement.classList.remove('screen-reader-support');
    }
    localStorage.setItem('accessibility-screen-reader', screenReaderSupport);
  }, [screenReaderSupport]);

  // Persist TTS and speech rate settings
  useEffect(() => {
    localStorage.setItem('accessibility-tts-enabled', ttsEnabled);
  }, [ttsEnabled]);

  useEffect(() => {
    localStorage.setItem('accessibility-speech-rate', speechRate);
  }, [speechRate]);

  // Speech rate mapping
  const speechRateMap = {
    slow: 0.5,
    normal: 1,
    fast: 1.5
  };

  // Text-to-Speech function
  const speak = useCallback((text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRateMap[speechRate] || 1;
    utterance.lang = 'en-US';
    
    // Get available voices and prefer English voices
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, speechRate]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Check if TTS is available
  const isTtsAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;

  return (
    <AccessibilityContext.Provider
      value={{
        // Font size
        fontSize,
        setFontSize,
        fontSizeMap,
        // Text-to-Speech
        ttsEnabled,
        setTtsEnabled,
        speechRate,
        setSpeechRate,
        speak,
        stopSpeaking,
        isTtsAvailable,
        // Other accessibility settings
        highContrast,
        setHighContrast,
        reduceMotion,
        setReduceMotion,
        screenReaderSupport,
        setScreenReaderSupport
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
