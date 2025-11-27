import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { X, Save, Upload, Video, Loader2, Camera, Square, Mic, Lock, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MoodSelector from "../components/journal/MoodSelector";
import { useSettings } from "@/contexts/SettingsContext";

export default function NewEntry() {
  const { isPremium } = useSettings();
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
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState("record"); // "record" | "upload"

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "tr-TR"; // Default to Turkish or use settings language

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNotes((prev) => prev + (prev ? " " : "") + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

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
    } else {
      // Audio files are no longer supported for upload as per requirements
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
      alert("❌ Kamera Erişimi Engellendi!\n\n📌 Çözüm:\n1. Tarayıcının adres satırındaki kilit/kamera ikonuna tıklayın\n2. 'Kamera' iznini AÇIK yapın\n3. Sayfayı yenileyin (F5)\n\nNot: HTTPS veya 192.168.x.x adresi gereklidir.");
    }
  };

  const handleVideoAction = (action) => {
    if (!isPremium) {
      if (confirm("Video recording is a Premium feature. Go to Settings to unlock?")) {
        navigate(createPageUrl("Settings"));
      }
      return;
    }
    action();
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
      let file_id = null;

      // Upload file to local storage if present
      if (file) {
        const result = await base44.integrations.Core.UploadFile({ file });
        file_id = result.file_url; // Actually returns the file ID
      }

      await createEntryMutation.mutateAsync({
        date,
        video_url: fileType === "video" ? file_id : null,
        audio_url: null,
        thumbnail_url: null,
        mood,
        notes,
      });
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("❌ Kaydetme Hatası!\n\n" + (error.message || "Lütfen tekrar deneyin."));
    }
    setIsUploading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(createPageUrl("MainFeed"))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-900" />
            </button>
            <button
              onClick={() => window.location.reload()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-slate-700"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">New Entry</h2>
          <button
            onClick={handleSave}
            disabled={(!file && !notes.trim()) || isUploading}
            className="bg-gradient-to-r bg-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-full text-white text-sm font-medium shadow-sm flex items-center gap-2"
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
        <div className="px-4 py-6">
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
                className="aspect-video bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-slate-300 hover:bg-slate-50/50 transition-all relative overflow-hidden"
              >
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Video className="w-12 h-12 text-slate-700" />
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-2">Record Video</p>
                <p className="text-sm text-gray-500">Tap to start recording</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  capture="user"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <video
                  src={filePreview}
                  controls
                  className="w-full aspect-video rounded-3xl bg-black"
                />
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

                {/* AI Transcription Button (Premium) */}
                {fileType === "video" && (
                  <Button
                    onClick={() => {
                      if (!isPremium) {
                        if (confirm("AI Video Analysis is a Premium feature. Go to Settings to unlock?")) {
                          navigate(createPageUrl("Settings"));
                        }
                      } else {
                        alert("AI Analysis will be implemented soon!");
                      }
                    }}
                    className="absolute bottom-4 right-4 rounded-full shadow-lg bg-gradient-to-r bg-teal-600 text-white flex items-center gap-2"
                  >
                    {!isPremium && <Lock className="w-4 h-4" />}
                    <Sparkles className="w-4 h-4" />
                    AI Analyze
                  </Button>
                )}
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Mood Selector */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">How are you feeling?</Label>
              <MoodSelector selected={mood} onSelect={setMood} />
            </div>

            {/* Notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold text-gray-700">Notes</Label>
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-full transition-all ${isListening
                    ? "bg-red-100 text-red-600 animate-pulse"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isListening ? "Listening..." : "A few notes about your day..."}
                className="min-h-32 rounded-xl border-gray-200 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}