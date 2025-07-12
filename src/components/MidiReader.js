import React, { useRef, useState, useEffect } from 'react';
import { Midi } from '@tonejs/midi';
import usePlayNotes from '../hooks/playNotes';
import { exportToMidi } from '../utils/track';
import withContainer from '../hoc/withContainer';
import Button from './common/Button';
import FileInput from './common/FileInput';
import { buttonContainerStyles } from '../styles/buttonContainer';
import renderPianoRoll from './PianoRollComp';
import {exportTracksToAudio} from '../utils/audio';
import * as Tone from 'tone';
import { urlsObj } from '../data/notesUrl';
import NoteSidebar from './NoteSidebar';


function MidiVisualizer() {
  const [notes, setNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const fileInputRef = useRef();
  const [tracks, setTracks] = useState([]);
  const [midiName, setMidiName] = useState('');
  const { isPlaying, playNotes } = usePlayNotes();
  const pianoSampler = useRef(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  useEffect(() => {
      pianoSampler.current = new Tone.Sampler({
        urls: urlsObj,
      }).toDestination();
    }, [tracks]);

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
    exportTracksToAudio(tracks, pianoSampler, (audioUrl) => {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = 'output.ogg';
      a.click();
    });
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
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'row', gap: '20px' }}>
      <div style={{ margin: '20px', padding: "10px", overflow: 'scroll', border: '1px solid black' }}>
        {notes.length > 0 ? renderPianoRoll(notes, handleDrag, setSelectedNoteId) : <p>Upload a MIDI file to see notes.</p>}
      </div>
      <NoteSidebar
                  selectedNoteId={selectedNoteId}
                  notes={notes}
                  setNotes={setNotes}
                  onClose={() => setSelectedNoteId(null)}
                />
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