// src/components/VideoCall/VideoCallModal.jsx
import React, { useState, useEffect } from 'react';
import VideoCallContainer from './VideoCallContainer';
import { apiUtils } from '../../api';
import { X } from 'lucide-react';

const VideoCallModal = ({ consultation, user, isOpen, onClose, onEndCall }) => {
  const [browserSupport, setBrowserSupport] = useState(null);
  const [validation, setValidation] = useState({ isValid: false, errors: [] });

  useEffect(() => {
    // Check browser support
    const support = apiUtils.videoCall.checkBrowserSupport();
    setBrowserSupport(support);
    
    // Validate consultation for video call
    const validationResult = apiUtils.videoCall.validateConsultationForVideoCall(consultation);
    setValidation(validationResult);
    
    if (!support.allSupported) {
      console.warn(support.message);
    }
  }, [consultation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">
              Video Call - {consultation.topic}
            </h2>
            <p className="text-gray-400 text-sm">
              Expert: {consultation.expert?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Browser Compatibility Warning */}
        {!browserSupport?.allSupported && (
          <div className="bg-yellow-900/30 border-l-4 border-yellow-500 p-4 m-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-300">
                  {browserSupport?.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {!validation.isValid && validation.errors.length > 0 && (
          <div className="bg-red-900/30 border-l-4 border-red-500 p-4 m-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-300">
                  Cannot start video call
                </h3>
                <div className="mt-2 text-sm text-red-200">
                  <ul className="list-disc pl-5 space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Call Container */}
        <div className="flex-1 overflow-hidden">
          {validation.isValid && browserSupport?.allSupported ? (
            <VideoCallContainer
              consultation={consultation}
              user={user}
              onEndCall={() => {
                onEndCall?.();
                onClose();
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="text-center">
                <div className="mx-auto h-24 w-24 text-gray-600 mb-4">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  Video call not available
                </h3>
                <p className="text-gray-400">
                  {validation.errors[0] || browserSupport?.message}
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;