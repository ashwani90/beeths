import React, { useState, useEffect, useRef } from 'react';
import Soundfont from 'soundfont-player';
import { Midi } from '@tonejs/midi';

const pianoNotes = [
  { note: 'C4', key: 'a' },
  { note: 'D4', key: 's' },
  { note: 'E4', key: 'd' },
  { note: 'F4', key: 'f' },
  { note: 'G4', key: 'g' },
  { note: 'A4', key: 'h' },
  { note: 'B4', key: 'j' },
  { note: 'C5', key: 'k' },
];

const drums = [
  { name: 'Kick', sound: '/sounds/kick.wav', key: 'z', midiNote: 36 },
  { name: 'Snare', sound: '/sounds/snare.wav', key: 'x', midiNote: 38 },
  { name: 'Hi-Hat', sound: '/sounds/hihat.wav', key: 'c', midiNote: 42 },
];

export default function PianoDrumCombo() {
  const [pianoPlayer, setPianoPlayer] = useState(null);
  const audioContextRef = useRef(null);

  // For visual feedback of active keys
  const [activeKeys, setActiveKeys] = useState(new Set());

  // Recording notes for MIDI export
  const notesRef = useRef([]);
  const startTimeRef = useRef(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    Soundfont.instrument(audioContextRef.current, 'acoustic_grand_piano').then(setPianoPlayer);

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (activeKeys.has(key)) return; // ignore repeated keydown for same key

      setActiveKeys((prev) => new Set(prev).add(key));
      const currentTime = performance.now();

      // Mark start time for recording
      if (!startTimeRef.current) startTimeRef.current = currentTime;

      // Piano keys
      const pianoNote = pianoNotes.find(p => p.key === key);
      if (pianoNote && pianoPlayer) {
        pianoPlayer.play(pianoNote.note, audioContextRef.current.currentTime, { duration: 1 });
        notesRef.current.push({
          midi: noteNameToMidi(pianoNote.note),
          time: (currentTime - startTimeRef.current) / 1000,
          duration: 1,
          velocity: 0.8,
          isDrum: false,
        });
      }

      // Drum keys
      const drum = drums.find(d => d.key === key);
      if (drum) {
        const audio = new Audio(drum.sound);
        audio.play();
        notesRef.current.push({
          midi: drum.midiNote,
          time: (currentTime - startTimeRef.current) / 1000,
          duration: 0.5,
          velocity: 1,
          isDrum: true,
        });
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      setActiveKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      audioContextRef.current.close();
    };
  }, [pianoPlayer, activeKeys]);

  // Helper: convert note name to MIDI number (C4 = 60)
  function noteNameToMidi(note) {
    const octave = parseInt(note.slice(-1));
    const notesMap = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
    let key = note.slice(0, -1);
    // Handle sharps (if any)
    if (!notesMap.hasOwnProperty(key)) key = key[0] + '#'; 
    return 12 * (octave + 1) + notesMap[key];
  }

  const playPianoNote = (note, key) => {
    if (pianoPlayer) {
      pianoPlayer.play(note, audioContextRef.current.currentTime, { duration: 1 });
      setActiveKeys((prev) => new Set(prev).add(key));

      const currentTime = performance.now();
      if (!startTimeRef.current) startTimeRef.current = currentTime;
      notesRef.current.push({
        midi: noteNameToMidi(note),
        time: (currentTime - startTimeRef.current) / 1000,
        duration: 1,
        velocity: 0.8,
        isDrum: false,
      });

      setTimeout(() => {
        setActiveKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 200);
    }
  };

  const playDrumSound = (soundUrl, key, midiNote) => {
    const audio = new Audio(soundUrl);
    audio.play();
    setActiveKeys((prev) => new Set(prev).add(key));

    const currentTime = performance.now();
    if (!startTimeRef.current) startTimeRef.current = currentTime;
    notesRef.current.push({
      midi: midiNote,
      time: (currentTime - startTimeRef.current) / 1000,
      duration: 0.5,
      velocity: 1,
      isDrum: true,
    });

    setTimeout(() => {
      setActiveKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }, 200);
  };

  // MIDI Export Function
  const exportMidi = () => {
    if (!notesRef.current.length) {
      alert('No notes played yet!');
      return;
    }

    const midi = new Midi();

    // Create two tracks: piano (program 0) and drums (channel 9)
    const pianoTrack = midi.addTrack();
    pianoTrack.instrument.number = 0;

    const drumTrack = midi.addTrack();
    drumTrack.channel = 9;
    drumTrack.instrument.number = 0; // drums use channel 9 anyway

    notesRef.current.forEach(note => {
      if (note.isDrum) {
        drumTrack.addNote({
          midi: note.midi,
          time: note.time,
          duration: note.duration,
          velocity: note.velocity,
        });
      } else {
        pianoTrack.addNote({
          midi: note.midi,
          time: note.time,
          duration: note.duration,
          velocity: note.velocity,
        });
      }
    });

    const bytes = midi.toArray();

    const blob = new Blob([bytes], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'composition.mid';
    a.click();
    URL.revokeObjectURL(url);

    // Reset recording
    notesRef.current = [];
    startTimeRef.current = null;
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">🎹 Piano + 🥁 Drum Combo with MIDI Export</h2>

      <div>
        <h3 className="font-semibold mb-2">Piano (Keys: A S D F G H J K)</h3>
        <div className="grid grid-cols-8 gap-2">
          {pianoNotes.map(({ note, key }) => (
            <button
              key={note}
              onClick={() => playPianoNote(note, key)}
              className={`font-bold py-2 rounded ${
                activeKeys.has(key) ? 'bg-blue-900 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title={`Press "${key.toUpperCase()}"`}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Drums (Keys: Z X C)</h3>
        <div className="grid grid-cols-3 gap-2">
          {drums.map(({ name, sound, key, midiNote }) => (
            <button
              key={name}
              onClick={() => playDrumSound(sound, key, midiNote)}
              className={`font-bold py-2 rounded ${
                activeKeys.has(key) ? 'bg-red-900 text-white' : 'bg-red-600 text-white hover:bg-red-700'
              }`}
              title={`Press "${key.toUpperCase()}"`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={exportMidi}
        className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold"
      >
        Export MIDI
      </button>
    </div>
  );
}
