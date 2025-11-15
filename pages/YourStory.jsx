import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useSettings } from "@/contexts/SettingsContext";
import { translations } from "@/locales/translations";

export default function YourStory() {
  const { language } = useSettings();
  const t = translations[language];

  const { data: entries, isLoading } = useQuery({
    queryKey: ['journalEntries'],
    queryFn: () => base44.entities.JournalEntry.list('-date'),
    initialData: [],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-900">{t.yourStory}</h2>
        </div>
        <p className="text-gray-500">{language === 'tr' ? 'Yapay zeka ile oluşturulmuş hikayem' : 'AI-powered narrative from my journal'}</p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-24 px-4">
          <div className="w-32 h-32 mx-auto mb-8 bg-amber-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-16 h-16 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{language === 'tr' ? 'Hikayeni Başlat' : 'Begin Your Story'}</h3>
          <p className="text-gray-500 text-lg">{t.startWriting}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Story Card */}
          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 shadow-sm overflow-hidden border-2 border-amber-200">
            {/* Notebook lines effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="h-8 border-b border-blue-300" />
              ))}
            </div>
            
            <div className="relative z-10">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-800 leading-relaxed" style={{ 
                  fontFamily: "'Caveat', cursive, sans-serif", 
                  fontSize: "1.3rem", 
                  lineHeight: "2" 
                }}>
                  {entries.slice(0, 8).map((entry, idx) => {
                    const date = format(new Date(entry.date), language === 'tr' ? "d MMMM" : "MMMM d");
                    const moodText = entry.mood === "happy" ? (language === 'tr' ? "harika hissediyordum" : "feeling great")
                                    : entry.mood === "sad" ? (language === 'tr' ? "zor zamanlar geçiriyordum" : "going through a tough time")
                                    : entry.mood === "excited" ? (language === 'tr' ? "enerji doluydum" : "full of energy")
                                    : entry.mood === "angry" ? (language === 'tr' ? "sinirliydim" : "feeling frustrated")
                                    : (language === 'tr' ? "normal bir gün geçiriyordum" : "having a normal day");
                    
                    return (
                      <span key={entry.id}>
                        {idx > 0 && " ... "}
                        {language === 'tr' ? (
                          <>
                            <strong>{date}</strong> günü {moodText}
                            {entry.notes && `: "${entry.notes.slice(0, 80)}${entry.notes.length > 80 ? "..." : ""}"`}
                            .
                          </>
                        ) : (
                          <>
                            On <strong>{date}</strong>, I was {moodText}
                            {entry.notes && `: "${entry.notes.slice(0, 80)}${entry.notes.length > 80 ? "..." : ""}"`}
                            .
                          </>
                        )}
                      </span>
                    );
                  })}
                  {entries.length > 8 && (language === 'tr' ? " ... ve daha nice anı kaydedildi." : " ... and many more moments captured.")}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 italic pt-4 mt-4 border-t border-amber-200">
                <span>✍️</span>
                <span>
                  {language === 'tr' 
                    ? `${entries.length} ${t.journalEntries} ${t.aiGenerated}`
                    : `${t.aiGenerated} ${entries.length} ${t.journalEntries}`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
              <p className="text-xs text-gray-500 mt-1">{t.totalEntries}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-900">
                {entries.filter(e => {
                  const entryDate = new Date(e.date);
                  const now = new Date();
                  return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">{t.thisMonth}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl">
                {entries.reduce((acc, e) => {
                  acc[e.mood] = (acc[e.mood] || 0) + 1;
                  return acc;
                }, {})[
                  Object.entries(entries.reduce((acc, e) => {
                    acc[e.mood] = (acc[e.mood] || 0) + 1;
                    return acc;
                  }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]
                ] ? 
                  (entries.reduce((acc, e) => {
                    acc[e.mood] = (acc[e.mood] || 0) + 1;
                    return acc;
                  }, {})[
                    Object.entries(entries.reduce((acc, e) => {
                      acc[e.mood] = (acc[e.mood] || 0) + 1;
                      return acc;
                    }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]
                  ] === "happy" ? "😊" 
                  : entries.reduce((acc, e) => {
                    acc[e.mood] = (acc[e.mood] || 0) + 1;
                    return acc;
                  }, {})[
                    Object.entries(entries.reduce((acc, e) => {
                      acc[e.mood] = (acc[e.mood] || 0) + 1;
                      return acc;
                    }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]
                  ] === "sad" ? "😢"
                  : entries.reduce((acc, e) => {
                    acc[e.mood] = (acc[e.mood] || 0) + 1;
                    return acc;
                  }, {})[
                    Object.entries(entries.reduce((acc, e) => {
                      acc[e.mood] = (acc[e.mood] || 0) + 1;
                      return acc;
                    }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]
                  ] === "excited" ? "✨"
                  : entries.reduce((acc, e) => {
                    acc[e.mood] = (acc[e.mood] || 0) + 1;
                    return acc;
                  }, {})[
                    Object.entries(entries.reduce((acc, e) => {
                      acc[e.mood] = (acc[e.mood] || 0) + 1;
                      return acc;
                    }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]
                  ] === "angry" ? "😠"
                  : "😐")
                  : "—"
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">{t.mostCommon}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
