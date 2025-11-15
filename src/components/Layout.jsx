import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Calendar, BarChart3, Home } from "lucide-react";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            My Journal
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 flex-shrink-0 safe-area-bottom">
        <div className="flex items-center justify-around px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              isActive("/")
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Home className={`w-6 h-6 ${isActive("/") ? "fill-purple-600" : ""}`} />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => navigate("/calendar")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              isActive("/calendar")
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Calendar className={`w-6 h-6 ${isActive("/calendar") ? "fill-purple-600" : ""}`} />
            <span className="text-xs font-medium">Calendar</span>
          </button>

          <button
            onClick={() => navigate("/stats")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              isActive("/stats")
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BarChart3 className={`w-6 h-6 ${isActive("/stats") ? "fill-purple-600" : ""}`} />
            <span className="text-xs font-medium">Stats</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
