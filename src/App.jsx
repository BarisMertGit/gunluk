import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout.jsx";
import MainFeed from "../pages/MainFeed.jsx";
import NewEntry from "../pages/NewEntry.jsx";
import CalendarView from "../pages/CalendarView.jsx";
import EntryDetail from "../pages/EntryDetail.jsx";
import Statistics from "../pages/Statistics.jsx";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Mobile Emulator Frame */}
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="w-full max-w-[430px] h-[932px] bg-white rounded-[3rem] shadow-2xl overflow-hidden relative border-8 border-gray-800">
            <Routes>
              <Route path="/" element={<Layout><MainFeed /></Layout>} />
              <Route path="/new" element={<NewEntry />} />
              <Route path="/calendar" element={<Layout><CalendarView /></Layout>} />
              <Route path="/entry" element={<Layout><EntryDetail /></Layout>} />
              <Route path="/stats" element={<Layout><Statistics /></Layout>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
