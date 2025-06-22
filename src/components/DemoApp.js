import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import usePianoSampler from '../hooks/usePianoSample';
import { urlsObj } from '../data/notesUrl';

const NOTES_IN_OCTAVE = 12;
const NOTE_HEIGHT = 20;
const PIANO_KEYS = 88;
const KEY_WIDTH = 40;
const INSTRUMENTS = ['piano', 'drums', 'violin'];
const instrumentColors = {
  piano: '#007bff',
  drums: '#dc3545',
  violin: '#28a745',
};

// Map keyboard keys to MIDI notes for piano (subset)
const pianoKeyMap = {
  KeyA: 60, // C4
  KeyS: 62, // D4
  KeyD: 64, // E4
  KeyF: 65, // F4
  KeyG: 67, // G4
  KeyH: 69, // A4
  KeyJ: 71, // B4
  KeyK: 72, // C5
};

// Drum step grid config
const DRUM_STEPS = 16;
const DRUM_NOTES = [36, 38, 42, 46]; // Kick, Snare, Closed HiHat, Open HiHat

function midiToNoteName(midi) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const note = noteNames[midi % 12];
  return note + octave;
}

function PianoRollEditor({ notes, selectedInstrument, onUpdateNotes, playingNotes }) {
    const canvasRef = useRef(null);
  
    const handleMouseClick = (event) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
  
      const midiNote = 21 + Math.floor((canvas.height - mouseY) / NOTE_HEIGHT);
      const startTime = (mouseX - KEY_WIDTH) / 200; // 200 is the time scale factor
      const duration = 0.5; // Default duration for a new note
  
      if (startTime >= 0 && midiNote >= 21 && midiNote <= 108) {
        onUpdateNotes([
          ...notes,
          {
            midi: midiNote,
            startTime,
            duration,
            instrument: selectedInstrument,
          },
        ]);
      }
    };
  
    useEffect(() => {
      const ctx = canvasRef.current.getContext('2d');
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
  
      ctx.clearRect(0, 0, width, height);
  
      // Draw piano keys vertically
      for (let i = 0; i < PIANO_KEYS; i++) {
        const midiNote = 21 + i;
        const y = height - (i + 1) * NOTE_HEIGHT;
        const isBlackKey = [1, 3, 6, 8, 10].includes(midiNote % 12);
        ctx.fillStyle = isBlackKey ? '#444' : '#eee';
        ctx.fillRect(0, y, KEY_WIDTH, NOTE_HEIGHT);
        ctx.strokeStyle = '#999';
        ctx.strokeRect(0, y, KEY_WIDTH, NOTE_HEIGHT);
  
        if (playingNotes.includes(midiNote)) {
          ctx.fillStyle = 'yellow';
          ctx.fillRect(0, y, KEY_WIDTH, NOTE_HEIGHT);
        }
  
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.fillText(midiToNoteName(midiNote), 5, y + 14);
      }
  
      // Draw notes
      const timeScale = 200;
      notes.forEach(({ midi, startTime, duration, instrument }) => {
        const x = KEY_WIDTH + startTime * timeScale;
        const y = height - (midi - 21 + 1) * NOTE_HEIGHT;
        const width = duration * timeScale;
  
        ctx.fillStyle = instrumentColors[instrument] || 'gray';
        ctx.fillRect(x, y, width, NOTE_HEIGHT - 2);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x, y, width, NOTE_HEIGHT - 2);
      });
    }, [notes, playingNotes]);
  
    return (
      <canvas
        ref={canvasRef}
        width={1000}
        height={PIANO_KEYS * NOTE_HEIGHT}
        style={{ border: '1px solid black', cursor: 'pointer' }}
        onClick={handleMouseClick}
      />
    );
  }
  

function DrumGridEditor({ drumNotes, onUpdateDrumNotes, playingStep }) {
  const [velocity, setVelocity] = useState(0.7);

  function toggleStep(midi, step) {
    const found = drumNotes.find((n) => n.midi === midi && n.step === step);
    if (found) {
      onUpdateDrumNotes(drumNotes.filter((n) => !(n.midi === midi && n.step === step)));
    } else {
      onUpdateDrumNotes([...drumNotes, { midi, step, velocity }]);
    }
  }

  return (
    <div>
      <h3>Drum Grid Editor</h3>
      <div style={{ marginBottom: 10 }}>
        <label>Velocity: </label>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={velocity}
          onChange={(e) => setVelocity(parseFloat(e.target.value))}
        />
      </div>
      <table style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Instrument</th>
            {[...Array(DRUM_STEPS).keys()].map((step) => (
              <th key={step} style={{ border: '1px solid black', padding: 5 }}>
                {step + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DRUM_NOTES.map((midi) => (
            <tr key={midi}>
              <td style={{ border: '1px solid black', padding: 5 }}>{midiToNoteName(midi)}</td>
              {[...Array(DRUM_STEPS).keys()].map((step) => {
                const active = drumNotes.find((n) => n.midi === midi && n.step === step);
                return (
                  <td
                    key={step}
                    style={{
                      border: '1px solid black',
                      padding: 5,
                      cursor: 'pointer',
                      backgroundColor: active ? `rgba(220, 53, 69, ${active.velocity})` : '#fff',
                    }}
                    onClick={() => toggleStep(midi, step)}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MusicEditorDemo() {
  const [notes, setNotes] = useState([]);
  const [drumNotes, setDrumNotes] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState('piano');
  const [playingNotes, setPlayingNotes] = useState([]);
  const [playingStep, setPlayingStep] = useState(0);
  let synth = useRef(null);
  const drumSampler = useRef(null);
  const pianoSampler = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    drumSampler.current = new Tone.Sampler({
      urls: {
        36: "kick.wav", // Kick
        38: "snare.wav", // Snare
        42: "hihat_closed.wav", // Closed HiHat
        46: "hihat_open.wav", // Open HiHat
      },
    }).toDestination();
  }, []);

  useEffect(() => {
    pianoSampler.current = new Tone.Sampler({
      urls: urlsObj,
    }).toDestination();
  }, []);

  const playNotes = async () => {
    if (isPlaying) return; // Prevent multiple playbacks
    setIsPlaying(true);

    await Tone.start();

    const now = Tone.now();

    notes.forEach(({ midi, startTime, duration }) => {
      pianoSampler.current.triggerAttackRelease(
        Tone.Frequency(midi, "midi"),
        duration,
        now + startTime
      );
    });

    // Stop playback after the last note
    const playbackDuration = Math.max(...notes.map((note) => note.startTime + note.duration));
    setTimeout(() => setIsPlaying(false), playbackDuration * 1000);
  };

  function playNotesAtTime(time) {
    notes.forEach(({ midi, startTime, duration, instrument }) => {
      if (startTime >= time && startTime < time + 0.25) {
        synth.triggerAttackRelease(Tone.Frequency(midi, "midi"), duration);
      }
    });

    drumNotes.forEach(({ midi, step }) => {
      if (step === playingStep) {
        drumSampler.current.triggerAttackRelease(Tone.Frequency(midi, "midi"));
      }
    });
  }

  function startPlayback() {
    Tone.start();
    Tone.Transport.scheduleRepeat((time) => {
      setPlayingStep((prev) => (prev + 1) % DRUM_STEPS);
      playNotesAtTime(time);
    }, "16n");
    Tone.Transport.start();
  }

  function stopPlayback() {
    Tone.Transport.stop();
    setPlayingStep(0);
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h2>Music Editor Demo with Tone.js</h2>
      <div>
        <label>Select Instrument: </label>
        <select value={selectedInstrument} onChange={(e) => setSelectedInstrument(e.target.value)}>
          {INSTRUMENTS.map((inst) => (
            <option key={inst} value={inst}>
              {inst}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 20 }}>
        {selectedInstrument === 'drums' ? (
          <DrumGridEditor drumNotes={drumNotes} onUpdateDrumNotes={setDrumNotes} playingStep={playingStep} />
        ) : (
          <PianoRollEditor notes={notes} selectedInstrument={selectedInstrument} onUpdateNotes={setNotes} playingNotes={playingNotes} />
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={playNotes} style={{ marginRight: 10 }}>
          Play
        </button>
        <button onClick={stopPlayback}>Stop</button>
      </div>
    </div>
  );
}
