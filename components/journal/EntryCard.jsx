import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Play } from "lucide-react";

const moodEmojis = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  angry: "😠",
  excited: "✨"
};

export default function EntryCard({ entry }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(createPageUrl("EntryDetail") + `?id=${entry.id}`)}
      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-[1.02] duration-300"
    >
      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-gray-900">
        <video
          src={entry.video_url}
          className="w-full h-full object-cover"
          preload="metadata"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-gray-900 ml-1" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Date and Mood */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900">
            {format(new Date(entry.date), "MMMM d, yyyy")}
          </h3>
          <span className="text-3xl">{moodEmojis[entry.mood]}</span>
        </div>

        {/* Notes Preview */}
        {entry.notes && (
          <p className="text-gray-600 line-clamp-2 leading-relaxed">
            {entry.notes}
          </p>
        )}
      </div>
    </div>
  );
}