import React from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { translations } from "@/locales/translations";
import { Settings as SettingsIcon, Globe, Palette, Sun, Moon } from "lucide-react";

export default function Settings() {
  const { language, setLanguage, theme, setTheme } = useSettings();
  const t = translations[language];

  return (
    <div className="px-4 py-6 pb-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-900">{t.settings}</h2>
        </div>
        <p className="text-gray-500">
          {language === 'tr' ? 'Uygulama tercihlerini özelleştir' : 'Customize your app preferences'}
        </p>
      </div>

      <div className="space-y-4">
        {/* Language Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t.language}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-2xl border-2 transition-all ${
                language === 'en'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <p className="text-2xl mb-1">🇬🇧</p>
                <p className={`text-sm font-medium ${
                  language === 'en' ? 'text-purple-600' : 'text-gray-700'
                }`}>
                  English
                </p>
              </div>
            </button>

            <button
              onClick={() => setLanguage('tr')}
              className={`p-4 rounded-2xl border-2 transition-all ${
                language === 'tr'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <p className="text-2xl mb-1">🇹🇷</p>
                <p className={`text-sm font-medium ${
                  language === 'tr' ? 'text-purple-600' : 'text-gray-700'
                }`}>
                  Türkçe
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t.appearance}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border-2 transition-all ${
                theme === 'light'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <Sun className={`w-8 h-8 mx-auto mb-2 ${
                  theme === 'light' ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  theme === 'light' ? 'text-purple-600' : 'text-gray-700'
                }`}>
                  {t.lightMode}
                </p>
              </div>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border-2 transition-all ${
                theme === 'dark'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <Moon className={`w-8 h-8 mx-auto mb-2 ${
                  theme === 'dark' ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-purple-600' : 'text-gray-700'
                }`}>
                  {t.darkMode}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 text-center">
          <p className="text-2xl mb-2">📖</p>
          <p className="text-sm font-semibold text-gray-900">{t.appName}</p>
          <p className="text-xs text-gray-500 mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
