import React, { useRef, useState, useEffect } from 'react';
import { Midi } from '@tonejs/midi';
import usePlayNotes from '../hooks/playNotes';
import { exportToMidi } from '../utils/track';
import withContainer from '../hoc/withContainer';
import Button from './common/Button';
import FileInput from './common/FileInput';
import { buttonContainerStyles } from '../styles/buttonContainer';
import renderPianoRoll from './PianoRollComp';
import * as Tone from 'tone';

function MidiVisualizer() {
  const [notes, setNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const fileInputRef = useRef();
  const [tracks, setTracks] = useState([]);
  const [midiName, setMidiName] = useState('');
  const { isPlaying, playNotes } = usePlayNotes();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const midi = new Midi(arrayBuffer);

    const extractedNotes = [];
    midi.tracks.forEach((track, trackIndex) => {
        const instrumentName = track.instrument.name || `Track ${trackIndex + 1}`;
      track.notes.forEach(note => {
        let index = parseInt(note.time/10);
        if (!extractedNotes[index]) {
          extractedNotes[index] = [];
        }
        extractedNotes[index].push({
          midi: note.midi,
          name: note.name,
          time: note.time,
          duration: note.duration,
          velocity: note.velocity,
          track: trackIndex,
          instrument: instrumentName,
          id: Math.random().toString(36).substr(2, 9) // Unique ID
        });
      });
    });
    setTracks(midi.tracks);
    setNotes(extractedNotes[0]);
    setAllNotes(extractedNotes);
    setMidiName(file.name);
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

  const handleDrag = (id, deltaX, deltaY, isResize) => {
    setNotes(prev =>
      prev.map(note => {
        if (note.id !== id) return note;

        const timeChange = deltaX / 100;
        const pitchChange = Math.round(deltaY / 20);

        if (isResize) {
          const newDuration = Math.max(0.1, note.duration + timeChange);
          return { ...note, duration: newDuration };
        } else {
          const newTime = Math.max(0, note.time + timeChange);
          const newMidi = note.midi - pitchChange;
          return {
            ...note,
            time: newTime,
            midi: newMidi,
          };
        }
      })
    );
  };

  return (
    <div style={{ margin: '20px', padding: "20px", overflow: 'auto' }}>
      <h2>MIDI File Visualizer with Note Editing</h2>
      <FileInput ref={fileInputRef}  handleFileUpload={handleFileChange}/>
      <div style={{ margin: '20px', padding: "10px", overflow: 'scroll', border: '1px solid black' }}>
        {notes.length > 0 ? renderPianoRoll(notes, handleDrag) : <p>Upload a MIDI file to see notes.</p>}
      </div>
      <div style={buttonContainerStyles}>
      <Button
        label={isPlaying ? "Playing..." : "Play Notes"}
        onClick={() => playNotes(notes)} disabled={isPlaying}
        />
        <Button
      label='Export To Midi'
      onClick={() => exportToMidi(tracks, 10)} 
        />
      <Button
        label='Export To Audio'
        onClick={() => exportToWav(tracks)}
      />
        </div>
    </div>
  );
}

export default withContainer(MidiVisualizer);