import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import withContainer from '../hoc/withContainer';
import usePlayNotes from '../hooks/playNotes';
import Button from './common/Button';
import { buttonContainerStyles } from '../styles/buttonContainer';
import Select from './common/Select';
import DrumGridEditor from './editors/DrumGridEditor';
import { DRUM_STEPS, INSTRUMENTS } from '../constants/music';
import PianoRollEditor from './editors/PianoRollEditor';
import { exportToMidi } from '../utils/track';

function MusicEditorDemo() {
  const [notes, setNotes] = useState([]);
  const [drumNotes, setDrumNotes] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState('piano');
  const [playingNotes, setPlayingNotes] = useState([]);
  const [playingStep, setPlayingStep] = useState(0);
  let synth = useRef(null);
  const drumSampler = useRef(null);
  const { isPlaying, playNotes } = usePlayNotes();
  const [tracks, setTracks] = useState([
    { id: "piano", name: "piano", notes: [] },
  ]);

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
    setTracks(prevTracks =>
      prevTracks.map(track =>
        track.id == 'piano'
          ? { ...track, notes: notes }
          : track
      )
    );
  }, [notes])
  
  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h2>Music Editor Demo with Tone.js</h2>
      <Select
        selectedInstrument={selectedInstrument}
        setSelectedInstrument={setSelectedInstrument}
        INSTRUMENTS={INSTRUMENTS}
      />

      <div style={{ marginTop: 20 }}>
        {selectedInstrument === 'drums' ? (
          <DrumGridEditor drumNotes={drumNotes} onUpdateDrumNotes={setDrumNotes} playingStep={playingStep} />
        ) : (
          <PianoRollEditor notes={notes} selectedInstrument={selectedInstrument} onUpdateNotes={setNotes} playingNotes={playingNotes} />
        )}
      </div>

      <div style={buttonContainerStyles}>
        <Button onClick={() => playNotes(notes)} disabled={isPlaying} label={isPlaying ? "Playing..." : "Play Notes"} />
        <Button onClick={() => console.log("Unable to stop for now")} label="Stop" />
        <Button label="Export To Midi"  onClick={() => exportToMidi(tracks, 0)} />
        <Button label="Export To Audio" />
      </div>
    </div>
  );
}


export default withContainer(MusicEditorDemo);