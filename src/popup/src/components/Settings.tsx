import React from "react";
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "react-i18next";

const Settings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="settings p-4 rounded-lg bg-white shadow-md dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">{t("settings.title")}</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-md font-medium mb-2">{t("settings.theme")}</h3>
          <ThemeSelector />
        </div>

        <div>
          <h3 className="text-md font-medium mb-2">{t("settings.language")}</h3>
          <LanguageSelector />
        </div>
      </div>
    </div>
  );
};

export default Settings;
