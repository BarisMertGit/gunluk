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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Statistics</h2>
        <p className="text-gray-600">Track your journey and emotional patterns</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Total Entries</p>
          <p className="text-3xl font-bold text-gray-900">{entries.length}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-pink-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">This Month</p>
          <p className="text-3xl font-bold text-gray-900">
            {entries.filter(e => {
              const entryDate = new Date(e.date);
              const now = new Date();
              return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <Smile className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Most Common</p>
          <p className="text-3xl font-bold">
            {moodDistribution.sort((a, b) => b.count - a.count)[0]?.mood || "—"}
          </p>
        </div>
      </div>

      {/* Mood Distribution Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-lg mb-8">
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
      <div className="bg-white rounded-3xl p-6 shadow-lg">
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