import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import EntryCard from "../components/journal/EntryCard";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";

export default function MainFeed() {
  const { data: entries, isLoading } = useQuery({
    queryKey: ['journalEntries'],
    queryFn: () => base44.entities.JournalEntry.list('-date'),
    initialData: [],
  });

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-6">
      {/* Weekly Mini Calendar */}
      <div className="mb-6">
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">This Week</h2>
            <span className="text-xs text-gray-500">
              {format(today, "MMM d")}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const entryForDay = entries.find((e) =>
                isSameDay(new Date(e.date), day)
              );
              const isToday = isSameDay(day, today);

              return (
                <div
                  key={day.toISOString()}
                  className={`flex flex-col items-center justify-center rounded-2xl py-1 ${
                    entryForDay
                      ? "bg-gradient-to-br from-purple-100 to-pink-100"
                      : "bg-gray-50"
                  } ${isToday ? "ring-2 ring-purple-600" : ""}`}
                >
                  <span className="text-[10px] text-gray-500">
                    {format(day, "EE").slice(0, 2)}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      isToday ? "text-purple-600" : "text-gray-900"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {entries.length === 0 ? (
          <div className="text-center py-24 px-4">
            <div className="w-32 h-32 mx-auto mb-8 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Journal</h3>
            <p className="text-gray-500 mb-8 text-lg">Capture your memories, one day at a time</p>
            <Link to={createPageUrl("NewEntry")}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-base">
                <Plus className="w-5 h-5 mr-2" />
                Create First Entry
              </Button>
            </Link>
          </div>
        ) : (
          entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <Link to={createPageUrl("NewEntry")}>
        <button 
          className="fixed bottom-20 right-6 w-14 h-14 rounded-full shadow-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all z-40 flex items-center justify-center"
        >
          <Plus className="w-7 h-7 text-white" />
        </button>
      </Link>
    </div>
  );
}