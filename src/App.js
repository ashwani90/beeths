import React, {useState} from 'react';
// import axios from 'axios';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
// import logo from './logo.svg';
import './App.css';
import PianoRoll from './components/PianoRoll';
import DrumPad from './components/DrumPad';
import InstrumentPlayer from './components/InstrumentPlayer';
import PianoDrumCombo from './components/PianoDrumCombo';
import MusicEditorDemo from './components/DemoApp';
import MidiVisualizer from './components/MidiReader';
import MidiPlayer from './components/MidiPlayer';
import PianoRollVisualizer from './components/PianoVisualizer';
import PianoButton from './components/PlayPiano';

function App() {
  const [file, setFile] = useState(null);

  const handleUpload = async (event) => {
    const formData = new FormData();
    formData.append('file', file);
    console.log('Uploading file:', file);
  }

  const handlePlay = async () => {
    const arrayBuffer = await file.arrayBuffer();
    console.log(arrayBuffer);
    const midi = new Midi(arrayBuffer);
    const synth = new Tone.Synth().toDestination();
    Tone.Transport.cancel();
    Tone.Transport.stop();
    midi.tracks.forEach(track => {
      track.notes.forEach((note, index) => {
        if (index > 0 && note.time <= track.notes[index - 1].time) {
            console.error(
                `Invalid note order: Note at index ${index} has time ${note.time}, but the previous note has time ${track.notes[index - 1].time}`
            );
        } else {
          synth.triggerAttackRelease(note.name, note.duration, note.time);
        }
        
      });
    });
    Tone.Transport.start();
  };

  return (
    <div>
      {/* <PianoButton /> */}
      <PianoRollVisualizer />
      {/* <MidiPlayer /> */}
      {/* <MidiVisualizer /> */}
      {/* <MusicEditorDemo /> */}
      {/* <h1>Upload and Play MIDI</h1>
      <input
        type="file"
        accept=".mid,.midi"
        onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
      <button onClick={handlePlay} disabled={!file}>Play MIDI</button>
      <DrumPad />
      <InstrumentPlayer />
      <PianoDrumCombo />
      <button
          onClick={exportMidi}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded font-semibold"
        >
          Export as MIDI
        </button>
      <PianoRoll /> */}
      
    </div>
  );
}

export default App;
