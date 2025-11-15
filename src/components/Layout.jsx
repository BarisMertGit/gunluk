import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Calendar, BarChart3, Home, Sparkles, Settings as SettingsIcon } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { translations } from "@/locales/translations";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useSettings();
  const t = translations[language];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            {t.appName}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation - 5 buttons */}
      <nav className="bg-white border-t border-gray-200 flex-shrink-0 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          <button
            onClick={() => navigate("/")}
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
              isActive("/")
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Home className={`w-5 h-5 ${isActive("/") ? "fill-purple-600" : ""}`} />
            <span className="text-[10px] font-medium">{t.home}</span>
          </button>

          <button
            onClick={() => navigate("/calendar")}
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
              isActive("/calendar")
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Calendar className={`w-5 h-5 ${isActive("/calendar") ? "fill-purple-600" : ""}`} />
            <span className="text-[10px] font-medium">{t.calendar}</span>
          </button>

          <button
            onClick={() => navigate("/story")}
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
              isActive("/story")
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Sparkles className={`w-5 h-5 ${isActive("/story") ? "fill-purple-600" : ""}`} />
            <span className="text-[10px] font-medium">{t.story}</span>
          </button>

          <button
            onClick={() => navigate("/stats")}
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
              isActive("/stats")
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${isActive("/stats") ? "fill-purple-600" : ""}`} />
            <span className="text-[10px] font-medium">{t.stats}</span>
          </button>

          <button
            onClick={() => navigate("/settings")}
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
              isActive("/settings")
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <SettingsIcon className={`w-5 h-5 ${isActive("/settings") ? "fill-purple-600" : ""}`} />
            <span className="text-[10px] font-medium">{t.settings}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
