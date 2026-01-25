import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    useEffect(() => {
        i18n.changeLanguage(language);
        localStorage.setItem('language', language);
        document.documentElement.setAttribute('lang', language);
    }, [language, i18n]);

    const toggleLanguage = () => {
        setLanguage(prevLang => prevLang === 'en' ? 'sw' : 'en');
    };

    const changeLanguage = (lang) => {
        if (['en', 'sw'].includes(lang)) {
            setLanguage(lang);
        }
    };

    const value = {
        language,
        toggleLanguage,
        changeLanguage,
        isSwahili: language === 'sw',
        isEnglish: language === 'en'
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
