import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";

const moodEmojis = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  angry: "😠",
  excited: "✨"
};

export default function CalendarView() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: entries, isLoading } = useQuery({
    queryKey: ['journalEntries'],
    queryFn: () => base44.entities.JournalEntry.list('-date'),
    initialData: [],
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEntryForDay = (day) => {
    return entries.find(entry => isSameDay(new Date(entry.date), day));
  };

  const handleDayClick = (entry) => {
    if (entry) {
      navigate(createPageUrl("EntryDetail") + `?id=${entry.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-7 h-7 text-gray-900" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          <ChevronRight className="w-7 h-7 text-gray-900" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array(monthStart.getDay()).fill(null).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const entry = getEntryForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <button
                key={index}
                onClick={() => handleDayClick(entry)}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center
                  transition-all hover:scale-105
                  ${entry 
                    ? 'bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                  }
                  ${isToday ? 'ring-2 ring-purple-600' : ''}
                `}
              >
                <span className={`text-sm font-medium ${isToday ? 'text-purple-600' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </span>
                {entry && (
                  <span className="text-2xl mt-1">
                    {moodEmojis[entry.mood]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100" />
          <span>Has Entry</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gray-50 border border-gray-200" />
          <span>No Entry</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg ring-2 ring-purple-600" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}