import React, { useState, useEffect, useRef } from 'react';
import Soundfont from 'soundfont-player';


// Soundfont is mostly deprecated so no need to have it
const instruments = [
  'acoustic_grand_piano',
  'violin',
  'flute',
  'synth_drum',
  'cello',
];

const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

export default function InstrumentPlayer() {
  const [instrumentName, setInstrumentName] = useState('acoustic_grand_piano');
  const [player, setPlayer] = useState(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    loadInstrument(instrumentName);
  }, []);

  useEffect(() => {
    if (audioContextRef.current) {
      loadInstrument(instrumentName);
    }
  }, [instrumentName]);

  const loadInstrument = async (name) => {
    const playerInstance = await Soundfont.instrument(audioContextRef.current, name);
    setPlayer(() => playerInstance);
  };

  const playNote = (note) => {
    if (player) {
      player.play(note, audioContextRef.current.currentTime, { duration: 1 });
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">🎹 Instrument Player</h2>

      <label className="block mb-2 font-medium">Choose Instrument:</label>
      <select
        className="p-2 border rounded mb-4 w-full"
        value={instrumentName}
        onChange={(e) => setInstrumentName(e.target.value)}
      >
        {instruments.map((instr) => (
          <option key={instr} value={instr}>
            {instr.replace(/_/g, ' ')}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-4 gap-2">
        {notes.map((note) => (
          <button
            key={note}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            onClick={() => playNote(note)}
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  );
}
