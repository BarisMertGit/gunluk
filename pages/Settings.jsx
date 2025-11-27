import React from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Crown, Smartphone, ShieldCheck, RefreshCw } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function Settings() {
  const { isPremium, setIsPremium } = useSettings();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(createPageUrl("MainFeed"))}
          className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Premium Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 mb-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Premium Access</h2>
            <p className="text-gray-400 text-sm">Unlock unlimited video recording</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setIsPremium(!isPremium)}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${isPremium
              ? "bg-green-600 text-white"
              : "bg-white text-black hover:bg-gray-200"
              }`}
          >
            {isPremium ? "Premium Active (Tap to Disable)" : "Get Premium"}
          </button>

          <button className="w-full py-3 bg-gray-800 text-gray-300 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Restore Purchases
          </button>
        </div>
      </div>

      {/* Account Section */}
      <div className="bg-gray-900 rounded-3xl p-6 mb-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          Account
        </h3>
        <button
          onClick={() => navigate(createPageUrl("Login"))}
          className="w-full py-3 bg-slate-700 text-white rounded-xl font-medium mb-3 hover:bg-blue-700 transition-colors"
        >
          Sign In / Sign Up
        </button>
        <p className="text-xs text-gray-500 text-center">
          Sync your journal across devices
        </p>
      </div>

      {/* App Stores */}
      <div className="text-center mt-12">
        <p className="text-gray-500 mb-4 text-sm">Download our mobile app</p>
        <div className="flex justify-center gap-4">
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-700">
            <Smartphone className="w-5 h-5 text-gray-400" />
            <div className="text-left">
              <p className="text-[10px] text-gray-400 leading-none">Download on the</p>
              <p className="text-sm font-bold text-white">App Store</p>
            </div>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-700">
            <Smartphone className="w-5 h-5 text-gray-400" />
            <div className="text-left">
              <p className="text-[10px] text-gray-400 leading-none">GET IT ON</p>
              <p className="text-sm font-bold text-white">Google Play</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
