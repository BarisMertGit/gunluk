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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-600 mb-4">Entry not found</p>
        <Button onClick={() => navigate(createPageUrl("MainFeed"))}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("MainFeed"))}
            className="rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteEntryMutation.mutate(entry.id)}
            className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Video Player */}
        <div className="mb-6">
          <video
            src={entry.video_url}
            controls
            className="w-full aspect-video rounded-3xl bg-black shadow-2xl"
          />
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
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
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
    </div>
  );
}