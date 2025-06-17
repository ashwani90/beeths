import React from 'react';

const drums = [
  { name: 'Kick', sound: '/sounds/kick.wav' },
  { name: 'Snare', sound: '/sounds/snare.wav' },
  { name: 'Hi-Hat', sound: '/sounds/hihat.wav' },
];

export default function DrumPad() {
  const playSound = (soundUrl) => {
    const audio = new Audio(soundUrl);
    audio.play();
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-xl font-semibold mb-4">🥁 Drum Pad</h2>
      <div className="grid grid-cols-3 gap-4">
        {drums.map((drum) => (
          <button
            key={drum.name}
            onClick={() => playSound(drum.sound)}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded shadow"
          >
            {drum.name}
          </button>
        ))}
      </div>
    </div>
  );
}
