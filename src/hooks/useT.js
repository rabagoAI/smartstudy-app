import { useTranslation } from 'react-i18next';

export const useT = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return { t, i18n, changeLanguage, language: i18n.language };
};
