import { EyeIcon, Volume2, Play, Square } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useState } from 'react';

const AccessibilityTab = () => {
  const {
    fontSize,
    setFontSize,
    ttsEnabled,
    setTtsEnabled,
    speechRate,
    setSpeechRate,
    speak,
    stopSpeaking,
    isTtsAvailable,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
    screenReaderSupport,
    setScreenReaderSupport
  } = useAccessibility();

  const [isPlaying, setIsPlaying] = useState(false);
  const [testText, setTestText] = useState('Welcome to the accessibility settings. This is a test of the text to speech feature.');

  const handleSpeakTest = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speak(testText);
      // Reset playing state after speech ends (approximate timing)
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  const fontSizeLabels = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    'extra-large': 'Extra Large'
  };

  const speechRateLabels = {
    slow: 'Slow',
    normal: 'Normal',
    fast: 'Fast'
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Options Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <EyeIcon className="mr-2" /> Visual Options
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">High Contrast Mode</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Font Size</label>
            <select 
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="small">{fontSizeLabels.small}</option>
              <option value="medium">{fontSizeLabels.medium}</option>
              <option value="large">{fontSizeLabels.large}</option>
              <option value="extra-large">{fontSizeLabels['extra-large']}</option>
            </select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Current: {fontSizeLabels[fontSize]} ({fontSize})
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Reduce Motion</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>


    </div>
  );
};

export default AccessibilityTab;
