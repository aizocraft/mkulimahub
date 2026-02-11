import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'sw', name: 'Kiswahili' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group"
        title={`Select language`}
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">
          {currentLanguage.code}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-in fade-in-0 zoom-in-95">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                lang.code === i18n.language
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
