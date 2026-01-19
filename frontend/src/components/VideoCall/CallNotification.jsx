import React, { useEffect, useState } from 'react';
import { Phone, X, Video, User } from 'lucide-react';

const CallNotification = ({
  caller,
  consultation,
  onAccept,
  onDecline,
  type = 'video'
}) => {
  const [show, setShow] = useState(true);
  const [timer, setTimer] = useState(30); // 30 second timeout

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          if (onDecline) onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [onDecline]);

  const handleAccept = () => {
    setShow(false);
    if (onAccept) onAccept();
  };

  const handleDecline = () => {
    setShow(false);
    if (onDecline) onDecline();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md animate-fade-in rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleDecline}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <X size={20} />
        </button>

        {/* Caller info */}
        <div className="flex flex-col items-center mb-6">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
            {caller?.profilePicture ? (
              <img
                src={caller.profilePicture}
                alt={caller.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <User size={40} className="text-white" />
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {caller?.name || 'Unknown Caller'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            is calling for a {type === 'video' ? 'video' : 'audio'} consultation
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Consultation: {consultation?.topic || 'General Consultation'}
          </div>
        </div>

        {/* Timer */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Call expires in:</span>
            <span className="font-mono text-red-600 dark:text-red-400">
              {timer}s
            </span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-red-500 transition-all duration-1000"
              style={{ width: `${(timer / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleDecline}
            className="flex items-center space-x-2 rounded-lg bg-red-500 px-6 py-3 text-white hover:bg-red-600"
          >
            <X size={20} />
            <span>Decline</span>
          </button>
          <button
            onClick={handleAccept}
            className="flex items-center space-x-2 rounded-lg bg-green-500 px-6 py-3 text-white hover:bg-green-600"
          >
            {type === 'video' ? <Video size={20} /> : <Phone size={20} />}
            <span>Accept</span>
          </button>
        </div>

        {/* Additional info */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex items-center text-sm">
            <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">
              This consultation is scheduled for{' '}
              {consultation?.formattedDate || 'today'} at{' '}
              {consultation?.startTime || 'now'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;