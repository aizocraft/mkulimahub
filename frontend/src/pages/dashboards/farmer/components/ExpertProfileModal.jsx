// src/pages/dashboards/farmer/components/ExpertProfileModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, BookOpen, Calendar, MessageCircle } from "lucide-react";

const ExpertProfileModal = ({ expert, isOpen, onClose, onBook }) => {
  if (!expert) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="relative h-64 bg-gradient-to-br from-emerald-500 to-blue-600">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white">
                <X className="w-6 h-6" />
              </button>
              <div className="absolute -bottom-16 left-8">
                <img src={expert.profilePicture || "/api/placeholder/120/120"} className="w-32 h-32 rounded-full ring-8 ring-white dark:ring-gray-800" />
              </div>
            </div>

            <div className="pt-20 px-8 pb-8">
              <h2 className="text-3xl font-bold">{expert.name}</h2>
              <p className="text-xl text-emerald-600 dark:text-emerald-400">{expert.specialty}</p>

              <div className="grid grid-cols-3 gap-4 my-8">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                  <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="font-bold">{expert.yearsOfExperience}+ yrs</div>
                  <div className="text-sm text-gray-600">Experience</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                  <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="font-bold">{expert.expertise?.length || 5}+</div>
                  <div className="text-sm text-gray-600">Specialties</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                  <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="font-bold text-green-600">Available</div>
                  <div className="text-sm text-gray-600">Now</div>
                </div>
              </div>

              <button
                onClick={onBook}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-xl transition flex items-center justify-center gap-3"
              >
                <MessageCircle className="w-6 h-6" />
                Book Consultation Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExpertProfileModal;