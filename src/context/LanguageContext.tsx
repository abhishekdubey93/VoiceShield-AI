import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, UiLanguage, UI_LANGUAGES } from '../i18n/translations';

interface LanguageContextProps {
  uiLanguage: UiLanguage;
  setUiLanguage: (lang: UiLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps>({
  uiLanguage: 'English',
  setUiLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiLanguage, setUiLanguageState] = useState<UiLanguage>(() => {
    try {
      const saved = localStorage.getItem('voiceshield_ui_language');
      return (saved as UiLanguage) || 'English';
    } catch {
      return 'English';
    }
  });

  const setUiLanguage = (lang: UiLanguage) => {
    setUiLanguageState(lang);
    try {
      localStorage.setItem('voiceshield_ui_language', lang);
    } catch (e) {
      console.error('Failed to save UI language:', e);
    }
  };

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[uiLanguage] || TRANSLATIONS['English'];
    return langDict[key] || TRANSLATIONS['English'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ uiLanguage, setUiLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
