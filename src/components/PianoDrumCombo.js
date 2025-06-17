import React, { useState, useEffect, useRef } from 'react';
import Soundfont from 'soundfont-player';

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

  // Visual feedback for pressed keys
  const [activeKeys, setActiveKeys] = useState(new Set());

  // Recording notes: { midi, startTime, duration, velocity, isDrum }
  const notesRef = useRef([]);
  // Track which notes are currently playing with start times for duration calculation
  const playingNotesRef = useRef({}); // key -> { startTime, midi, isDrum }

  // Reference to AudioContext for playback
  const playbackAudioContextRef = useRef(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    Soundfont.instrument(audioContextRef.current, 'acoustic_grand_piano').then(setPianoPlayer);

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (activeKeys.has(key)) return; // ignore repeat keydown

      setActiveKeys((prev) => new Set(prev).add(key));

      const now = performance.now();

      // Piano keys
      const pianoNote = pianoNotes.find(p => p.key === key);
      if (pianoNote && pianoPlayer) {
        pianoPlayer.play(pianoNote.note, audioContextRef.current.currentTime, { duration: 10 }); // long duration, we control real duration on keyup

        playingNotesRef.current[key] = {
          startTime: now,
          midi: noteNameToMidi(pianoNote.note),
          velocity: 0.8,
          isDrum: false,
        };
      }

      // Drum keys
      const drum = drums.find(d => d.key === key);
      if (drum) {
        const audio = new Audio(drum.sound);
        audio.play();

        // Drums are short, record with fixed duration
        notesRef.current.push({
          midi: drum.midiNote,
          time: (now - (notesRef.current[0]?.startTime || now)) / 1000,
          duration: 0.5,
          velocity: 1,
          isDrum: true,
        });

        playingNotesRef.current[key] = null; // no "key up" for drums
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      setActiveKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });

      const now = performance.now();

      const playingNote = playingNotesRef.current[key];
      if (playingNote) {
        const startTime = playingNote.startTime;
        const duration = (now - startTime) / 1000;
        const timeSinceFirstNote = notesRef.current.length
          ? (startTime - notesRef.current[0].startTime) / 1000
          : 0;

        // Push note with duration
        notesRef.current.push({
          midi: playingNote.midi,
          time: timeSinceFirstNote,
          duration: duration > 0 ? duration : 0.1,
          velocity: playingNote.velocity,
          isDrum: false,
          startTime, // store for next notes
        });

        delete playingNotesRef.current[key];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      audioContextRef.current.close();
    };
  }, [pianoPlayer, activeKeys]);

  // Convert note name to MIDI number (C4=60)
  function noteNameToMidi(note) {
    const octave = parseInt(note.slice(-1));
    const notesMap = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
    let key = note.slice(0, -1);
    if (!notesMap.hasOwnProperty(key)) key = key[0] + '#';
    return 12 * (octave + 1) + notesMap[key];
  }

  // Playback recorded notes
  const playRecording = () => {
    if (!notesRef.current.length) {
      alert('No notes recorded yet!');
      return;
    }

    if (!playbackAudioContextRef.current) {
      playbackAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ac = playbackAudioContextRef.current;

    Soundfont.instrument(ac, 'acoustic_grand_piano').then(pianoPlayer => {
      const startTime = ac.currentTime + 0.1; // small delay to start

      notesRef.current.forEach(note => {
        const playAt = startTime + note.time;
        if (note.isDrum) {
          // Play drum sound at scheduled time
          setTimeout(() => {
            const drum = drums.find(d => d.midiNote === note.midi);
            if (drum) {
              const audio = new Audio(drum.sound);
              audio.play();
            }
          }, (playAt - ac.currentTime) * 1000);
        } else {
          // Play piano note at scheduled time
          pianoPlayer.play(noteNameFromMidi(note.midi), playAt, { duration: note.duration, gain: note.velocity });
        }
      });
    });
  };

  // Convert midi number back to note name (simplified)
  function noteNameFromMidi(midi) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const note = notes[midi % 12];
    return note + octave;
  }

  // Play single piano note (for clicks)
  const playPianoNote = (note, key) => {
    if (pianoPlayer) {
      pianoPlayer.play(note, audioContextRef.current.currentTime, { duration: 1 });
      setActiveKeys((prev) => new Set(prev).add(key));

      const now = performance.now();
      if (!notesRef.current.length) {
        notesRef.current[0] = { startTime: now };
      }

      // For click play, treat duration as 1 sec
      notesRef.current.push({
        midi: noteNameToMidi(note),
        time: (now - notesRef.current[0].startTime) / 1000,
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

  // Play single drum note (for clicks)
  const playDrumSound = (soundUrl, key, midiNote) => {
    const audio = new Audio(soundUrl);
    audio.play();
    setActiveKeys((prev) => new Set(prev).add(key));

    const now = performance.now();
    if (!notesRef.current.length) {
      notesRef.current[0] = { startTime: now };
    }

    notesRef.current.push({
      midi: midiNote,
      time: (now - notesRef.current[0].startTime) / 1000,
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

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Piano Keyboard</h2>
      <div className="flex space-x-1">
        {pianoNotes.map(({ note, key }) => (
          <button
            key={key}
            onClick={() => playPianoNote(note, key)}
            className={`p-4 border rounded ${activeKeys.has(key) ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            {note} ({key.toUpperCase()})
          </button>
        ))}
      </div>

      <h2 className="text-2xl font-semibold">Drum Pads</h2>
      <div className="flex space-x-1">
        {drums.map(({ name, sound, key }) => (
          <button
            key={key}
            onClick={() => playDrumSound(sound, key, drums.find(d => d.key === key).midiNote)}
            className={`p-4 border rounded ${activeKeys.has(key) ? 'bg-red-500 text-white' : 'bg-white'}`}
          >
            {name} ({key.toUpperCase()})
          </button>
        ))}
      </div>

      <button
        onClick={playRecording}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded font-semibold"
      >
        Play Recording
      </button>
    </div>
  );
}
