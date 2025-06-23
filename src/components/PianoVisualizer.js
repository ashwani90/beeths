import React, { useEffect, useRef, useState } from 'react';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import { exportToMidi } from '../utils/track';
import usePianoSampler from '../hooks/usePianoSample';
import exportToAudio from '../utils/audio';

const NOTE_HEIGHT = 8;
const PIXELS_PER_SECOND = 100;



const PianoRollVisualizer = () => {
  const [tracks, setTracks] = useState([]);
  const [duration, setDuration] = useState(0);
  const [midiName, setMidiName] = useState('');
  const sampler = usePianoSampler();
  const recorder = useRef(new Tone.Recorder());
  const cursorRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const midi = new Midi(arrayBuffer);

    const trackData = midi.tracks.filter((track) => track.notes.length > 0).map((track, index) => ({
      name: track.instrument.name || track.name || `Track ${index}`,
      notes: track.notes,
      index,
      color: `hsl(${(index * 72) % 360}, 70%, 60%)`,
    }));

    setTracks(trackData);
    setDuration(midi.duration);
    setMidiName(file.name);
  };

  const drawTrack = (canvas, notes, color) => {
    const ctx = canvas.getContext('2d');
    const width = duration * PIXELS_PER_SECOND;
    const minPitch = 21;
    const maxPitch = 108;
    const height = (maxPitch - minPitch + 1) * NOTE_HEIGHT;
    let unique_notes = [];
  
    canvas.width = width;
    canvas.height = height;
  
    ctx.clearRect(0, 0, width, height);
    ctx.font = '10px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
  
    notes.forEach(note => {
      const x = note.time * PIXELS_PER_SECOND;
      const y = (maxPitch - note.midi) * NOTE_HEIGHT;
      const w = note.duration * PIXELS_PER_SECOND;
      const h = NOTE_HEIGHT;
  
      // Draw the note rectangle
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
  
      // Draw the note label
      ctx.fillStyle = 'black';

      const label = midiToNoteName(note.midi);
      if (!unique_notes.includes(label)) {
        unique_notes.push(label);
        }
      ctx.fillText(label, x + 2, y + h / 2); // small padding inside the box
    });
    console.log(unique_notes);
  };

  
  // Converts MIDI number to note name (e.g., 60 -> C4)
  const midiToNoteName = (midi) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const note = notes[midi % 12];
    return `${note}${octave}`;
  };
  

  const play = async () => {
    await Tone.start();
  
    const now = Tone.now();
  
    // Use your custom sampler for all tracks
    const synths = tracks.map(() => sampler); // Replace PolySynth with your sampler
  
    tracks.forEach((track, i) => {
      track.notes.forEach(note => {
        console.log("triggered note ", now + note.time, "For duration", note.duration, "with velocity", note.velocity);
        // Ensure sampler is loaded before triggering
        if (synths[i] && note.midi) {
          synths[i].triggerAttackRelease(
            Tone.Frequency(note.midi, 'midi'),
            note.duration,
            now + note.time,
            note.velocity
          );
        }
      });
    });
  
    // Cursor animation
    const cursor = cursorRef.current;
    cursor.style.left = '0px';
    cursor.style.display = 'block';
    const start = performance.now();
  
    const animate = (time) => {
      const elapsed = (time - start) / 1000;
      const x = elapsed * PIXELS_PER_SECOND;
      cursor.style.left = `${x}px`;
  
      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        cursor.style.display = 'none';
      }
    };
  
    requestAnimationFrame(animate);
  };

  
  const exportToWav = async (tracks) => {
    await Tone.start();

    const recorder = new Tone.Recorder();
    const synth = new Tone.PolySynth(Tone.Synth).connect(recorder);
    recorder.start();

    const now = Tone.now();

    tracks.forEach((track) => {
      track.notes.forEach((note) => {
        synth.triggerAttackRelease(
          Tone.Frequency(note.midi, "midi"),
          note.duration,
          now + note.time
        );
      });
    });

    Tone.Transport.start();

    // Wait for playback duration
    const playbackDuration = tracks.reduce((max, track) => {
      const lastNote = track.notes[track.notes.length - 1];
      return Math.max(max, lastNote.time + lastNote.duration);
    }, 0);

    await new Promise((resolve) =>
      setTimeout(() => {
        Tone.Transport.stop();
        resolve();
      }, (playbackDuration + 0.5) * 1000)
    );

    // Stop recording and save the file
    const recording = await recorder.stop();
    const blob = new Blob([recording], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${midiName || "output"}.wav`;
    link.click();
    URL.revokeObjectURL(url);
  };
  

  useEffect(() => {
    tracks.forEach(track => {
        console.log(track);
      const canvas = document.getElementById(`track-${track.index}`);
      if (canvas) {
        drawTrack(canvas, track.notes, track.color);
      }
    });
  }, [tracks]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">🎼 Multi-Track Piano Roll</h2>
      <input type="file" accept=".mid" onChange={handleFileUpload} className="mb-4" />
      {midiName && <div className="mb-2">Loaded: {midiName}</div>}

      <div style={{ position: 'relative', overflowX: 'auto', border: '1px solid #ccc' }}>
        {tracks.map((track, i) => (
          <div key={i} className="mb-2">
            <div className="font-semibold text-sm mb-1">{track.name}</div>
            <div style={{ position: 'relative' }}>
              <canvas id={`track-${track.index}`} style={{ display: 'block' }} />
              {i === 0 && (
                <div
                  ref={cursorRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: '2px',
                    backgroundColor: 'red',
                    height: '100%',
                    display: 'none',
                    zIndex: 10
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {tracks.length > 0 && (
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={play}
        >
          ▶ Play
        </button>
      )}
      <button
        className="mt-2 ml-2 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => exportToMidi(tracks, 0)}
        >
        💾 Export MIDI
        </button>
        <button
        className="mt-2 ml-2 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => exportToWav(tracks)}
      >
        🎵 Export MP3
      </button>
        
    </div>
  );
};

export default PianoRollVisualizer;
