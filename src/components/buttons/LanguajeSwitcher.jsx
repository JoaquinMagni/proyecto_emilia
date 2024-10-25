import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center h-full">
      <button
        onClick={() => changeLanguage('en')}
        className={`text-blue-500 ${i18n.language === 'en' ? 'font-bold' : 'text-gray-500'}`}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('es')}
        className={`text-blue-500 ml-4 ${i18n.language === 'es' ? 'font-bold' : 'text-gray-500'}`}
      >
        Español
      </button>
    </div>
  );
};

export default LanguageSwitcher;