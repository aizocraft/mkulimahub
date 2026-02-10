import { useState, useEffect } from 'react';
import { X, Phone, CheckCircle, Loader2, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { mpesaAPI } from '../api';

const MpesaPaymentModal = ({ isOpen, onClose, consultation, onPaymentSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  if (!isOpen) return null;

  // Update full phone number when digits change
  useEffect(() => {
    const digitsOnly = phoneDigits.replace(/\s/g, '');
    if (digitsOnly.length === 9) {
      setPhoneNumber(`+254 ${phoneDigits}`);
    } else {
      setPhoneNumber('');
    }
  }, [phoneDigits]);

  // Load stored phone digits from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const storedDigits = localStorage.getItem('mpesa_phone_digits');
      if (storedDigits) {
        setPhoneDigits(storedDigits);
      }
    }
  }, [isOpen]);

  // Format the 9 digits after +254
  const formatPhoneDigits = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Limit to 9 digits
    const limitedDigits = digits.slice(0, 9);

    // Format as xxx xxx xxx
    if (limitedDigits.length <= 3) {
      return limitedDigits;
    } else if (limitedDigits.length <= 6) {
      return `${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3)}`;
    } else {
      return `${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3, 6)} ${limitedDigits.slice(6)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const formattedDigits = formatPhoneDigits(value);
    setPhoneDigits(formattedDigits);

    // Validate phone number (must be exactly 9 digits)
    const digitsOnly = formattedDigits.replace(/\s/g, '');
    if (digitsOnly.length > 0 && digitsOnly.length !== 9) {
      setPhoneError('Please enter a valid 9-digit Kenyan phone number');
    } else {
      setPhoneError('');
    }
  };

  const handlePayment = async () => {
    if (!phoneDigits.trim() || phoneError) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (!consultation || (!consultation._id && !consultation.id)) {
      toast.error('Consultation information is missing');
      return;
    }

    setIsProcessing(true);

    try {
      const consultationId = consultation._id || consultation.id;
      const paymentData = {
        consultationId: consultationId,
        phoneNumber: phoneNumber.replace(/\s/g, ''), // Remove spaces for API
        amount: consultation.payment?.amount || 0,
      };

      const response = await mpesaAPI.initiatePayment(paymentData);

      // Store phone digits in localStorage for future use
      localStorage.setItem('mpesa_phone_digits', phoneDigits);

      setIsProcessing(false);
      setIsSuccess(true);
      toast.success('STK Push sent successfully! Check your phone.');

      // Call onPaymentSuccess callback if provided
      if (onPaymentSuccess) {
        onPaymentSuccess(consultationId);
      }

      // Auto close after success
      setTimeout(() => {
        setIsSuccess(false);
        setPhoneDigits('');
        onClose();
      }, 3000);
    } catch (error) {
      setIsProcessing(false);
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setPhoneNumber('');
      setPhoneDigits('');
      setPhoneError('');
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full">
        {/* Decorative background elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-green-400/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-400/20 rounded-full blur-xl"></div>

        <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
          {/* Header with gradient */}
          <div className="relative p-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-4 -translate-x-4"></div>

            <div className="relative flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">M-Pesa Payment</h3>
                  <p className="text-sm opacity-90">Secure & Instant</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {!isSuccess ? (
              <>
                {/* Consultation Details */}
                {consultation && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {consultation.topic}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      KSh {consultation.payment?.amount?.toLocaleString() || '0'}
                    </p>
                  </div>
                )}

                {/* Phone Number Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 pr-4 flex items-center pointer-events-none bg-gray-100 dark:bg-gray-700 rounded-l-2xl border-r border-gray-300 dark:border-gray-600">
                      <span className="text-gray-900 dark:text-white font-medium">+254</span>
                    </div>
                    <input
                      type="tel"
                      value={phoneDigits}
                      onChange={handlePhoneChange}
                      placeholder="712 345 678"
                      className="w-full pl-20 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500"
                      disabled={isProcessing}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {phoneError}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enter your 9-digit Safaricom number
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleClose}
                    disabled={isProcessing}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-all duration-200 disabled:opacity-50 transform hover:scale-105 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing || !phoneDigits.trim() || phoneError}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      'Pay Now'
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-8 space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-lg">
                    <CheckCircle size={40} className="text-white animate-bounce" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-green-400/30 rounded-full mx-auto animate-ping"></div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Payment Successful! 🎉
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    STK Push sent to {phoneNumber}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Check your phone to complete the payment
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MpesaPaymentModal;
