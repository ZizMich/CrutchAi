import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";
// Icons for languages
import { GlobeAltIcon } from "@heroicons/react/24/outline";

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="language-selector w-full">
      <div className="flex space-x-2 w-full justify-between">
        <button
          onClick={() => setLanguage("en")}
          className={`flex items-center justify-center p-2 rounded-md transition-all ${
            language === "en"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          }`}
          aria-label="English"
        >
          <GlobeAltIcon className="h-5 w-5 mr-1" />
          <span>{t("languages.english")}</span>
        </button>

        <button
          onClick={() => setLanguage("es")}
          className={`flex items-center justify-center p-2 rounded-md transition-all ${
            language === "es"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          }`}
          aria-label="Spanish"
        >
          <GlobeAltIcon className="h-5 w-5 mr-1" />
          <span>{t("languages.spanish")}</span>
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;
