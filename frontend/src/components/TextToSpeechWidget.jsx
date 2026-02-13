import { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Volume2, VolumeX, X, Maximize2 } from 'lucide-react';

const TextToSpeechWidget = () => {
  const { ttsEnabled, speak, stopSpeaking, isTtsAvailable, speechRate } = useAccessibility();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState('');

  // Don't show the widget if TTS is not enabled or available
  if (!ttsEnabled || !isTtsAvailable) {
    return null;
  }

  const extractPageContent = () => {
    // Get the main content area - try common selectors
    const mainContent = document.querySelector('main') || 
                       document.querySelector('.main-content') ||
                       document.querySelector('#main-content') ||
                       document.querySelector('.content') ||
                       document.body;
    
    // Get all text content from the main area, excluding navigation and footer
    const excludeSelectors = ['nav', 'header', 'footer', '.navbar', '.nav', '.footer', 'script', 'style', 'noscript'];
    
    const clone = mainContent.cloneNode(true);
    
    // Remove excluded elements
    excludeSelectors.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    // Get text content
    let text = clone.textContent || clone.innerText || '';
    
    // Clean up the text
    text = text
      .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
      .replace(/\n+/g, ' ')  // Replace newlines with spaces
      .trim();
    
    // Limit text length to avoid very long speeches (max 5000 characters)
    if (text.length > 5000) {
      text = text.substring(0, 5000) + '... content truncated for readability.';
    }
    
    return text;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      setStatus('Stopped');
      setTimeout(() => setStatus(''), 2000);
    } else {
      const content = extractPageContent();
      
      if (!content || content.length < 10) {
        setStatus('No content found');
        setTimeout(() => setStatus(''), 2000);
        return;
      }
      
      setIsPlaying(true);
      setStatus('Reading page...');
      
      // Speak the content
      speak(content);
      
      // Monitor speech synthesis to detect when it ends
      const checkSpeechEnd = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsPlaying(false);
          setStatus('Finished');
          clearInterval(checkSpeechEnd);
          setTimeout(() => setStatus(''), 2000);
        }
      }, 500);
      
      // Also stop if user manually stops
      setTimeout(() => {
        if (!window.speechSynthesis.speaking) {
          setIsPlaying(false);
          clearInterval(checkSpeechEnd);
        }
      }, 100);
    }
  };

  const handleStop = () => {
    stopSpeaking();
    setIsPlaying(false);
    setStatus('Stopped');
    setTimeout(() => setStatus(''), 2000);
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-auto'
      }`}
    >
      {/* Status Message */}
      {status && (
        <div className="absolute bottom-full mb-2 left-0 right-0 text-center">
          <div className="inline-block px-3 py-1 bg-gray-800 text-white text-sm rounded-lg">
            {status}
          </div>
        </div>
      )}
      
      {/* Main Widget */}
      <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className={`p-3 flex items-center justify-center transition-colors ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
            title={isPlaying ? 'Stop reading' : 'Read page content'}
          >
            {isPlaying ? (
              <VolumeX size={20} />
            ) : (
              <Volume2 size={20} />
            )}
          </button>
          
          {/* Expanded Content */}
          {isExpanded && (
            <div className="flex items-center px-2">
              <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">
                Page Reader
              </span>
              <button
                onClick={handleStop}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Stop"
              >
                <X size={18} />
              </button>
            </div>
          )}
          
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <Maximize2 size={18} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Help Text */}
      {isExpanded && (
        <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg">
          Click the speaker button to read the current page content aloud.
        </div>
      )}
    </div>
  );
};

export default TextToSpeechWidget;
