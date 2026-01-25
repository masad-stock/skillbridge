import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();
    const { t } = useTranslation();

    return (
        <div
            className="language-toggle"
            onClick={toggleLanguage}
            role="button"
            aria-label={t('settings.language')}
            title={t('settings.language')}
        >
            <span className="language-toggle-flag">
                {language === 'en' ? '🇬🇧' : '🇰🇪'}
            </span>
            <span className="language-toggle-text">
                {language === 'en' ? 'EN' : 'SW'}
            </span>
        </div>
    );
}

export default LanguageToggle;
