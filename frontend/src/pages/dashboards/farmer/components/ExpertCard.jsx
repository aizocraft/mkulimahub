// src/pages/dashboards/farmer/components/ExpertCard.jsx
import { motion } from "framer-motion";
import { Shield, MessageCircle, User, MapPin } from "lucide-react";
import RatingDisplay from "./RatingDisplay";

const ExpertCard = ({ expert, onViewProfile, onBook }) => {
  return (
    <motion.div
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30">
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${expert.availability === 'available' ? 'bg-green-500' : 'bg-yellow-500'}`}>
            ● {expert.availability || "Available"}
          </span>
          {expert.isVerified && <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full flex items-center gap-1"><Shield className="w-3 h-3" /> Verified</span>}
        </div>

        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <img
            src={expert.profilePicture || `https://ui-avatars.com/api/?name=${expert.name}&background=3b82f6&color=fff`}
            alt={expert.name}
            className="w-28 h-28 rounded-full object-cover ring-8 ring-white dark:ring-gray-800 shadow-2xl"
          />
        </div>
      </div>

      <div className="pt-16 pb-6 px-6 text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{expert.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{expert.specialty || "Agricultural Expert"}</p>
        <RatingDisplay average={expert.rating?.average || 4.8} count={expert.rating?.count || 89} />

        <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-2">
          <MapPin className="w-4 h-4" /> {expert.address?.county || "Kenya"}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onViewProfile} className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition">
            <User className="w-4 h-4" /> Profile
          </button>
          <button onClick={onBook} className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition">
            <MessageCircle className="w-4 h-4" /> Book Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpertCard;