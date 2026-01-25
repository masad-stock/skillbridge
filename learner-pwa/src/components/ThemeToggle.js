import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const { t } = useTranslation();

    return (
        <div
            className="theme-toggle"
            onClick={toggleTheme}
            role="button"
            aria-label={t('settings.theme')}
            title={theme === 'light' ? t('settings.darkMode') : t('settings.lightMode')}
        >
            <div className="theme-toggle-slider">
                {theme === 'light' ? '☀️' : '🌙'}
            </div>
        </div>
    );
}

export default ThemeToggle;
