import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { X, Save, Upload, Video, Loader2, Camera, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MoodSelector from "../components/journal/MoodSelector";

export default function NewEntry() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [mood, setMood] = useState("happy");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState("record"); // "record" | "upload"

  const createEntryMutation = useMutation({
    mutationFn: (entryData) => base44.entities.JournalEntry.create(entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      navigate(createPageUrl("MainFeed"));
    },
  });

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (selectedFile.type.startsWith("video/")) {
      setFileType("video");
    } else if (selectedFile.type.startsWith("audio/")) {
      setFileType("audio");
    } else {
      return;
    }
    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
  };

  const cleanupMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startRecording = async () => {
    try {
      recordedChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const previewUrl = URL.createObjectURL(blob);
        setFile(blob);
        setFileType("video");
        setFilePreview(previewUrl);
        cleanupMediaStream();
        setIsRecording(false);
      };

      mediaRecorder.start();
      setFile(null);
      setFilePreview(null);
      setFileType("video");
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting camera:", error);
      alert("Could not access your camera. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      cleanupMediaStream();
      setIsRecording(false);
    }
  };

  const handleSave = async () => {
    if (!file && !notes.trim()) return;

    setIsUploading(true);
    try {
      let file_url = null;
      if (file) {
        const result = await base44.integrations.Core.UploadFile({ file });
        file_url = result.file_url;
      }

      await createEntryMutation.mutateAsync({
        date,
        video_url: fileType === "video" ? file_url : null,
        audio_url: fileType === "audio" ? file_url : null,
        thumbnail_url: fileType === "video" ? file_url : null,
        mood,
        notes,
      });
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Failed to save your entry. Please try again.");
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
              disabled={(!file && !notes.trim()) || isUploading}
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

        <div className="mb-4 flex gap-2">
          <Button
            variant={mode === "record" ? "default" : "outline"}
            onClick={() => {
              setMode("record");
            }}
            className="flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Record with Camera
          </Button>
          <Button
            variant={mode === "upload" ? "default" : "outline"}
            onClick={() => {
              setMode("upload");
              cleanupMediaStream();
              setIsRecording(false);
            }}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload from Device
          </Button>
        </div>

        {/* Video Upload/Preview */}
        <div className="mb-6">
          {mode === "record" ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-3xl overflow-hidden flex items-center justify-center">
                {filePreview ? (
                  <video
                    src={filePreview}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex gap-2">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    variant="secondary"
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Square className="w-4 h-4" />
                    Stop Recording
                  </Button>
                )}
                {filePreview && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFile(null);
                      setFilePreview(null);
                      setFileType(null);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          ) : !filePreview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video bg-white rounded-3xl border-2 border-dashed border-purple-200 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all"
            >
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Video className="w-12 h-12 text-purple-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">Upload a Video or Audio</p>
              <p className="text-sm text-gray-500">Tap to select from your device</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              {fileType === "video" ? (
                <video
                  src={filePreview}
                  controls
                  className="w-full aspect-video rounded-3xl bg-black"
                />
              ) : (
                <audio
                  src={filePreview}
                  controls
                  className="w-full"
                />
              )}
              <Button
                size="icon"
                variant="secondary"
                onClick={() => {
                  setFile(null);
                  setFilePreview(null);
                  setFileType(null);
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