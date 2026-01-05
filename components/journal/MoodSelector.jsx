import React from "react";

const moods = [
  { value: "happy", label: "Happy" },
  { value: "neutral", label: "Neutral" },
  { value: "sad", label: "Sad" },
  { value: "angry", label: "Angry" },
  { value: "excited", label: "Excited" },
];

export default function MoodSelector({ selected, onSelect }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {moods.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onSelect(mood.value)}
          className={`
            flex-shrink-0 flex flex-col items-center gap-2 px-6 py-4 rounded-2xl
            transition-all duration-200
            ${selected === mood.value
              ? 'bg-slate-100 scale-105 shadow-md border-2 border-slate-300'
              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
            }
          `}
        >
          <span className={`text-sm font-semibold ${selected === mood.value ? 'text-slate-800' : 'text-gray-600'
            }`}>
            {mood.label}
          </span>
        </button>
      ))}
    </div>
  );
}