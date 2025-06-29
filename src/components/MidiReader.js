import React, { useRef, useState, useEffect } from 'react';
import { Midi } from '@tonejs/midi';
import { groupByInstrument } from '../utils/track';
import usePlayNotes from '../hooks/playNotes';
import * as Tone from 'tone';
import { urlsObj } from '../data/notesUrl';
import { exportToMidi } from '../utils/track';
import withContainer from '../hoc/withContainer';

function MidiVisualizer() {
  const [notes, setNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const fileInputRef = useRef();
  const [tracks, setTracks] = useState([]);
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

  const renderPianoRoll = () => {
    const groupedTracks = groupByInstrument(notes);
  
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {groupedTracks.map((group, index) => {
          const maxTime = Math.max(...group.notes.map(n => n.time + n.duration));
          const minMidi = Math.min(...group.notes.map(n => n.midi));
          const maxMidi = Math.max(...group.notes.map(n => n.midi));
  
          return (
            <div key={index}>
              <h4>{group.instrument} (Track {group.track + 1})</h4>
              <div
                style={{
                  position: 'relative',
                  width: maxTime * 100 + 'px',
                  height: (maxMidi - minMidi + 1) * 20 + 'px',
                  border: '1px solid #ccc',
                  overflowX: 'auto',
                }}
              >
                {group.notes.map(note => (
                  <DraggableNote
                    key={note.id}
                    note={note}
                    minMidi={minMidi}
                    onDrag={(dx, dy, isResize) =>
                      handleDrag(note.id, dx, dy, isResize)
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  

  return (
    <div style={{ margin: '20px', padding: "10px", overflow: 'auto', border: '3px solid black' }}>
      <h2>MIDI File Visualizer with Note Editing</h2>
      <input type="file" accept=".mid,.midi" ref={fileInputRef} onChange={handleFileChange} />
      <div style={{ margin: '20px', padding: "10px", overflow: 'auto', border: '1px solid black' }}>
        {notes.length > 0 ? renderPianoRoll() : <p>Upload a MIDI file to see notes.</p>}
      </div>
      <button onClick={() => playNotes(notes)} disabled={isPlaying}>
        {isPlaying ? "Playing..." : "Play Notes"}
      </button>
        <button onClick={() => exportToMidi(tracks, 10)} style={{ marginRight: 10 }}>
          Export To Midi
        </button>
        <button  style={{ marginRight: 10 }}>
          Export To Audio
        </button>
    </div>
  );
}

function DraggableNote({ note, minMidi, onDrag }) {
  const ref = useRef(null);
  const resizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e, isResize = false) => {
    resizing.current = isResize;
    startPos.current = { x: e.clientX, y: e.clientY };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    onDrag(dx, dy, resizing.current);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  const top = (note.midi - minMidi) * 20;
  const left = note.time * 100;
  const width = note.duration * 100;

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: top,
        left: left,
        width: width,
        height: '18px',
        backgroundColor: `rgba(30, 144, 255, ${note.velocity})`,
        border: '1px solid #0077cc',
        borderRadius: '4px',
        cursor: 'move',
        userSelect: 'none',
      }}
      onMouseDown={(e) => handleMouseDown(e, false)}
    >
      <div
        style={{
          position: 'absolute',
          right: 0,
          width: '6px',
          height: '100%',
          backgroundColor: 'white',
          cursor: 'ew-resize',
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, true);
        }}
      />
    </div>
  );
}

export default withContainer(MidiVisualizer);