import { usePage } from "@inertiajs/react";

export const useTranslations = () => {
    const { translations = {} } = usePage().props;
    return (key, replacements = {}) => {
        let text = translations[key] ?? key;

        for (const [placeholder, value] of Object.entries(replacements)) {
            text = text.replaceAll(`:${placeholder}`, value);
        }

        return text;
    };
};
