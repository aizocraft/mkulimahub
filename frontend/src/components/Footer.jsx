import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className={`bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Mkulima Hub Logo" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                // Fallback if logo doesn't exist
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div 
              className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center hidden"
              style={{ display: 'none' }}
            >
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} Mkulima Hub. All rights reserved.
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/about" 
              className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors duration-200"
            >
              About
            </Link>
            <Link
              to="/help"
              className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors duration-200"
            >
              Help
            </Link>
            <Link
              to="/forum"
              className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors duration-200"
            >
              Forum
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm transition-colors duration-200"
            >
              Contact
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;