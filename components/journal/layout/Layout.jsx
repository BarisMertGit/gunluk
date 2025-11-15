import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, BarChart3, BookOpen } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            to={createPageUrl("Statistics")}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <BarChart3 className="w-6 h-6 text-gray-700" />
          </Link>
          
          <Link to={createPageUrl("MainFeed")} className="flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-purple-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Journal
            </h1>
          </Link>
          
          <Link 
            to={createPageUrl("CalendarView")}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Calendar className="w-6 h-6 text-gray-700" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>
    </div>
  );
}