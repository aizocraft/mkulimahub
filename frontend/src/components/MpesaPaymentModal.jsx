import { useState } from 'react';
import { X } from 'lucide-react';

const MpesaPaymentModal = ({ isOpen, onClose, consultation }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">M-Pesa Payment</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Pay for your consultation using M-Pesa
              </p>
              {consultation && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Consultation: {consultation.topic}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Amount: KSh {consultation.payment?.amount?.toLocaleString() || '0'}
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Payment logic will be implemented here
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MpesaPaymentModal;
