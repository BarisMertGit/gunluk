import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2, TrendingUp, Calendar as CalendarIcon, Smile } from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

const moodEmojis = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  angry: "😠",
  excited: "✨"
};

const moodColors = {
  happy: "#fbbf24",
  neutral: "#60a5fa",
  sad: "#9ca3af",
  angry: "#ef4444",
  excited: "#a78bfa"
};

export default function Statistics() {
  const { data: entries, isLoading } = useQuery({
    queryKey: ['journalEntries'],
    queryFn: () => base44.entities.JournalEntry.list('-date'),
    initialData: [],
  });

  // Calculate mood distribution
  const moodDistribution = React.useMemo(() => {
    const moodCounts = {
      happy: 0,
      neutral: 0,
      sad: 0,
      angry: 0,
      excited: 0
    };

    entries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood]++;
      }
    });

    return Object.entries(moodCounts).map(([mood, count]) => ({
      mood: moodEmojis[mood],
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      count,
      color: moodColors[mood]
    }));
  }, [entries]);

  // Calculate activity heat map (last 90 days)
  const activityHeatMap = React.useMemo(() => {
    const today = startOfDay(new Date());
    const daysAgo = subDays(today, 89);
    const days = eachDayOfInterval({ start: daysAgo, end: today });

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const entry = entries.find(e => e.date === dayStr);
      return {
        date: dayStr,
        mood: entry?.mood || null,
        hasEntry: !!entry
      };
    });
  }, [entries]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Statistics</h2>
        <p className="text-gray-500">Track your journey and emotional patterns</p>
      </div>

      {/* Stats Cards */}
      <div className="space-y-4 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-3">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <CalendarIcon className="w-7 h-7 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Total Entries</p>
              <p className="text-4xl font-bold text-gray-900">{entries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-3">
            <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-7 h-7 text-pink-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">This Month</p>
              <p className="text-4xl font-bold text-gray-900">
                {entries.filter(e => {
                  const entryDate = new Date(e.date);
                  const now = new Date();
                  return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-3">
            <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Smile className="w-7 h-7 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Most Common</p>
              <p className="text-4xl font-bold">
                {moodDistribution.sort((a, b) => b.count - a.count)[0]?.mood || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Journal Summary */}
      <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 shadow-sm mb-8 overflow-hidden border-2 border-amber-200">
        {/* Notebook lines effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-8 border-b border-blue-300" />
          ))}
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✨</span>
            <h3 className="text-xl font-semibold text-gray-900">Your Story</h3>
          </div>
          
          {entries.length === 0 ? (
            <p className="text-gray-500 italic text-center py-8">
              Start writing entries to see your story unfold...
            </p>
          ) : (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed" style={{ fontFamily: "'Caveat', cursive, sans-serif", fontSize: "1.1rem", lineHeight: "1.8" }}>
                  {entries.slice(0, 5).map((entry, idx) => {
                    const date = format(new Date(entry.date), "MMMM d");
                    const moodText = entry.mood === "happy" ? "feeling great" 
                                    : entry.mood === "sad" ? "going through a tough time"
                                    : entry.mood === "excited" ? "full of energy"
                                    : entry.mood === "angry" ? "feeling frustrated"
                                    : "having a normal day";
                    
                    return (
                      <span key={entry.id}>
                        {idx > 0 && " ... "}
                        On <strong>{date}</strong>, I was {moodText}
                        {entry.notes && `: "${entry.notes.slice(0, 60)}${entry.notes.length > 60 ? "..." : ""}"`}
                        .
                      </span>
                    );
                  })}
                  {entries.length > 5 && " ... and many more moments captured."}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 italic pt-2 border-t border-amber-200">
                <span>✍️</span>
                <span>AI-generated story from your {entries.length} journal entries</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mood Distribution Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Mood Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={moodDistribution}>
            <XAxis 
              dataKey="mood" 
              tick={{ fontSize: 24 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: 'none', 
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar dataKey="count" radius={[12, 12, 0, 0]}>
              {moodDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Activity Heat Map */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Activity Heat Map (Last 90 Days)</h3>
        <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-18 gap-2">
          {activityHeatMap.map((day, index) => (
            <div
              key={index}
              className="aspect-square rounded-lg transition-transform hover:scale-125"
              style={{
                backgroundColor: day.hasEntry 
                  ? moodColors[day.mood] 
                  : '#f3f4f6'
              }}
              title={`${format(new Date(day.date), 'MMM d, yyyy')}${day.hasEntry ? ` - ${day.mood}` : ' - No entry'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-6 text-sm text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-gray-200" />
            <div className="w-4 h-4 rounded bg-blue-200" />
            <div className="w-4 h-4 rounded bg-blue-400" />
            <div className="w-4 h-4 rounded bg-blue-600" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}