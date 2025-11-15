import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { X, Save, Upload, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MoodSelector from "../components/journal/MoodSelector";

export default function NewEntry() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [mood, setMood] = useState("happy");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isUploading, setIsUploading] = useState(false);

  const createEntryMutation = useMutation({
    mutationFn: (entryData) => base44.entities.JournalEntry.create(entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      navigate(createPageUrl("MainFeed"));
    },
  });

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!videoFile) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: videoFile });
      
      await createEntryMutation.mutateAsync({
        date,
        video_url: file_url,
        thumbnail_url: file_url,
        mood,
        notes,
      });
    } catch (error) {
      console.error("Error saving entry:", error);
    }
    setIsUploading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => navigate(createPageUrl("MainFeed"))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-900" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">New Entry</h2>
            <button
              onClick={handleSave}
              disabled={!videoFile || isUploading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-full text-white text-sm font-medium shadow-sm flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 py-6">{/* Content wrapper */}

        {/* Video Upload/Preview */}
        <div className="mb-6">
          {!videoPreview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video bg-white rounded-3xl border-2 border-dashed border-purple-200 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all"
            >
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Video className="w-12 h-12 text-purple-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">Upload a Video</p>
              <p className="text-sm text-gray-500">Tap to select from your device</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <video
                src={videoPreview}
                controls
                className="w-full aspect-video rounded-3xl bg-black"
              />
              <Button
                size="icon"
                variant="secondary"
                onClick={() => {
                  setVideoFile(null);
                  setVideoPreview(null);
                }}
                className="absolute top-4 right-4 rounded-full shadow-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Metadata Form */}
        <div className="bg-white rounded-3xl p-6 space-y-6 shadow-sm">
          {/* Date */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">Date</Label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>

          {/* Mood Selector */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">How are you feeling?</Label>
            <MoodSelector selected={mood} onSelect={setMood} />
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="A few notes about your day..."
              className="min-h-32 rounded-xl border-gray-200 focus:ring-purple-500"
            />
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}