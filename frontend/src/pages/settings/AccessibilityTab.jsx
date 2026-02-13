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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Accessibility</h2>
        {isTtsAvailable && (
          <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
            <Volume2 size={16} className="mr-1" /> Text-to-Speech Available
          </span>
        )}
      </div>

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

      {/* Audio Options Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Volume2 className="mr-2" /> Audio Options
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-gray-700 dark:text-gray-300">Text-to-Speech</span>
              {!isTtsAvailable && (
                <span className="ml-2 text-xs text-red-500">(Not supported in this browser)</span>
              )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={ttsEnabled}
                onChange={(e) => setTtsEnabled(e.target.checked)}
                disabled={!isTtsAvailable}
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${!isTtsAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
            </label>
          </div>
          
          {ttsEnabled && isTtsAvailable && (
            <>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Speech Rate</label>
                <select 
                  value={speechRate}
                  onChange={(e) => setSpeechRate(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="slow">{speechRateLabels.slow}</option>
                  <option value="normal">{speechRateLabels.normal}</option>
                  <option value="fast">{speechRateLabels.fast}</option>
                </select>
              </div>
              
              {/* Test TTS Section */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Test Text-to-Speech</label>
                <textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm mb-3"
                  rows={3}
                  placeholder="Enter text to speak..."
                />
                <button
                  onClick={handleSpeakTest}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isPlaying 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Square size={16} className="mr-2" /> Stop
                    </>
                  ) : (
                    <>
                      <Play size={16} className="mr-2" /> Speak
                    </>
                  )}
                </button>
              </div>
            </>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Screen Reader Support</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={screenReaderSupport}
                onChange={(e) => setScreenReaderSupport(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Accessibility Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Accessibility Status</h3>
        <p className="text-gray-700 dark:text-gray-300">
          Your current accessibility settings:
        </p>
        <ul className="mt-4 space-y-2">
          <li className="text-gray-600 dark:text-gray-400">
            Font Size: <span className="font-medium text-gray-900 dark:text-white">{fontSizeLabels[fontSize]}</span>
          </li>
          <li className="text-gray-600 dark:text-gray-400">
            Text-to-Speech: <span className={`font-medium ${ttsEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>{ttsEnabled ? 'Enabled' : 'Disabled'}</span>
          </li>
          <li className="text-gray-600 dark:text-gray-400">
            Speech Rate: <span className="font-medium text-gray-900 dark:text-white">{speechRateLabels[speechRate]}</span>
          </li>
          <li className="text-gray-600 dark:text-gray-400">
            High Contrast: <span className={`font-medium ${highContrast ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>{highContrast ? 'Enabled' : 'Disabled'}</span>
          </li>
          <li className="text-gray-600 dark:text-gray-400">
            Reduce Motion: <span className={`font-medium ${reduceMotion ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>{reduceMotion ? 'Enabled' : 'Disabled'}</span>
          </li>
          <li className="text-gray-600 dark:text-gray-400">
            Screen Reader: <span className={`font-medium ${screenReaderSupport ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>{screenReaderSupport ? 'Enabled' : 'Disabled'}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AccessibilityTab;
