import React, { useState } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';

const MidiPlayer = () => {
  const [midiData, setMidiData] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [playing, setPlaying] = useState(false);

  const instrumentMap = {}; // Cache loaded instruments

  const loadMidi = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const midi = new Midi(arrayBuffer);
    setMidiData(midi);

    const trackInstruments = await Promise.all(
      midi.tracks.map(async (track) => {
        const programNumber = track.instrument.number;
        const isPercussion = track.instrument.family === 'drums';

        const name = track.instrument.name || track.name || 'Unknown';

        if (!instrumentMap[name]) {
          const instrument = isPercussion
            ? new Tone.MembraneSynth().toDestination()
            : new Tone.PolySynth().toDestination(); // You can use Sampler for realism
          instrumentMap[name] = instrument;
        }

        return { name, isPercussion, synth: instrumentMap[name], track };
      })
    );

    setInstruments(trackInstruments);
  };

  const playMidi = async () => {
    if (!midiData) return;
    await Tone.start(); // Required by Tone.js to begin audio

    const now = Tone.now();
    const baseStart = now + 0.5;

    instruments.forEach(({ synth, track }) => {
      track.notes.forEach((note) => {
        synth.triggerAttackRelease(
          Tone.Frequency(note.midi, 'midi'),
          note.duration,
          baseStart + note.time,
          note.velocity
        );
      });
    });

    setPlaying(true);

    setTimeout(() => setPlaying(false), midiData.duration * 1000 + 500);
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">🎵 MIDI Player</h2>

      <input type="file" accept=".mid" onChange={loadMidi} />
      <button
        onClick={playMidi}
        disabled={!midiData || playing}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        ▶ Play
      </button>

      {instruments.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Detected Instruments:</h3>
          <ul className="list-disc ml-5">
            {instruments.map((inst, i) => (
              <li key={i}>
                {inst.name} ({inst.isPercussion ? 'Drums' : 'Melody'})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MidiPlayer;
