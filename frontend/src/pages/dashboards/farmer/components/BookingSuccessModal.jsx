// src/pages/dashboards/farmer/components/BookingSuccessModal.jsx
import { motion } from "framer-motion";
import { CheckCircle, Calendar, Clock } from "lucide-react";

const BookingSuccessModal = ({ isOpen, onClose, expertName = "Dr. John" }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-10 text-center max-w-md shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-24 h-24 mx-auto mb-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500" />
        </motion.div>

        <h2 className="text-3xl font-bold mb-4">Booking Confirmed!</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          You have successfully booked a consultation with <strong>{expertName}</strong>
        </p>

        <div className="my-8 space-y-4 text-left bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <span>Calendar invite sent to your email</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <span>Choose your preferred time slot</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition"
        >
          Done
        </button>
      </motion.div>
    </motion.div>
  );
};

export default BookingSuccessModal;