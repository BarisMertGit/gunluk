import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const moodEmojis = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  angry: "😠",
  excited: "✨"
};

const moodLabels = {
  happy: "Happy",
  neutral: "Neutral",
  sad: "Sad",
  angry: "Angry",
  excited: "Excited"
};

export default function EntryDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const entryId = urlParams.get('id');
  const isPremium =
    typeof window !== "undefined" &&
    window.localStorage.getItem("is_premium") === "true";

  const { data: entry, isLoading } = useQuery({
    queryKey: ['journalEntry', entryId],
    queryFn: async () => {
      const entries = await base44.entities.JournalEntry.filter({ id: entryId });
      return entries[0];
    },
    enabled: !!entryId,
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (id) => base44.entities.JournalEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      navigate(createPageUrl("MainFeed"));
    },
  });

  const analyzeEntryMutation = useMutation({
    mutationFn: async () => {
      const fileUrl = entry?.video_url || entry?.audio_url;
      const type = entry?.video_url ? "video" : "audio";
      if (!fileUrl) {
        throw new Error("No media to analyze");
      }
      const { analysis } = await base44.integrations.AI.AnalyzeFile({
        file_url: fileUrl,
        type,
      });
      await base44.entities.JournalEntry.update(entry.id, {
        ai_analysis: analysis,
      });
      return analysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntry', entryId] });
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-gray-500 text-lg mb-6">Entry not found</p>
        <button
          onClick={() => navigate(createPageUrl("MainFeed"))}
          className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-medium hover:bg-gray-800 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-6">
      {/* Action Buttons */}
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={() => deleteEntryMutation.mutate(entry.id)}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

        {/* Video Player */}
        <div className="mb-6">
          {entry.video_url ? (
            <video
              src={entry.video_url}
              controls
              className="w-full aspect-video rounded-3xl bg-black shadow-2xl"
            />
          ) : entry.audio_url ? (
            <audio
              src={entry.audio_url}
              controls
              className="w-full"
            />
          ) : null}
        </div>

        {/* Entry Details */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 space-y-6">
          {/* Date and Mood */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Date</p>
              <p className="text-2xl font-bold text-gray-900">
                {format(new Date(entry.date), "MMMM d, yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-br from-blue-50 to-pink-50 rounded-2xl">
              <span className="text-4xl">{moodEmojis[entry.mood]}</span>
              <div>
                <p className="text-xs text-gray-500">Mood</p>
                <p className="font-semibold text-gray-900">{moodLabels[entry.mood]}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {entry.notes && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.notes}</p>
              </div>
            </div>
          )}

          {(entry.video_url || entry.audio_url) && (
            <div>
              <Button
                onClick={() => {
                  if (!isPremium) {
                    alert("This feature is only available for premium users.");
                    return;
                  }
                  analyzeEntryMutation.mutate();
                }}
                disabled={analyzeEntryMutation.isPending}
                className="mt-2"
              >
                {analyzeEntryMutation.isPending ? "Analyzing..." : "Analyze with AI"}
              </Button>
            </div>
          )}

          {entry.ai_analysis && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">AI Analysis</p>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.ai_analysis}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {entry.location && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Location</p>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-gray-700">{entry.location}</p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}