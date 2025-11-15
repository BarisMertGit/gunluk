import React from "react";

const moods = [
  { value: "happy", emoji: "😊", label: "Happy" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
  { value: "sad", emoji: "😢", label: "Sad" },
  { value: "angry", emoji: "😠", label: "Angry" },
  { value: "excited", emoji: "✨", label: "Excited" },
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
              ? 'bg-gradient-to-br from-purple-100 to-pink-100 scale-110 shadow-lg'
              : 'bg-gray-50 hover:bg-gray-100'
            }
          `}
        >
          <span className="text-4xl">{mood.emoji}</span>
          <span className={`text-sm font-medium ${
            selected === mood.value ? 'text-purple-900' : 'text-gray-600'
          }`}>
            {mood.label}
          </span>
        </button>
      ))}
    </div>
  );
}