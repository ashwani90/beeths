import React, { useEffect, useRef, useState } from 'react';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import { exportToMidi } from '../utils/track';
import usePianoSampler from '../hooks/usePianoSample';
import exportToAudio from '../utils/audio';
import withContainer from '../hoc/withContainer';
import { drawTrack } from '../utils/track';
import Button from './common/Button';
import FileInput from './common/FileInput';
import { buttonContainerStyles } from '../styles/buttonContainer';

const PianoRollVisualizer = () => {
  const [tracks, setTracks] = useState([]);
  const [duration, setDuration] = useState(0);
  const [midiName, setMidiName] = useState('');
  const sampler = usePianoSampler();
  const recorder = useRef(new Tone.Recorder());
  const cursorRefs = useRef([]);

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

  useEffect(() => {
    // Initialize refs dynamically based on tracks length
    cursorRefs.current = Array.from({ length: tracks.length }, () => React.createRef());
  }, [tracks]);
  

  const play = async () => {
    await Tone.start();
    console.log(cursorRefs);
  
    const now = Tone.now();
  
    // Use your custom sampler for all tracks
    const synths = tracks.map(() => sampler); // Replace PolySynth with your sampler
  
    // Calculate the total duration dynamically
    let totalDuration = 0;
    tracks.forEach((track) => {
      track.notes.forEach(note => {
        const endTime = note.time + note.duration;
        if (endTime > totalDuration) {
          totalDuration = endTime;
        }
        // Ensure sampler is loaded before triggering
        if (synths[tracks.indexOf(track)] && note.midi) {
          synths[tracks.indexOf(track)].triggerAttackRelease(
            Tone.Frequency(note.midi, 'midi'),
            note.duration,
            now + note.time,
            note.velocity
          );
        }
      });
    });
  
    // Pixels per second for cursor animation
    const PIXELS_PER_SECOND = 100;
  
    const start = performance.now();
  
    const animate = (time) => {
      const elapsed = (time - start) / 1000;
      const x = elapsed * PIXELS_PER_SECOND;
  
      // Update cursor position for each track
      cursorRefs.current.forEach((cursorRef) => {
        if (cursorRef) {
          if (elapsed < totalDuration) {
            cursorRef.style.left = `${x}px`;
            cursorRef.style.display = "block";
          } else {
            cursorRef.style.display = "none";
          }
        }
      });
  
      if (elapsed < totalDuration) {
        requestAnimationFrame(animate);
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
      const canvas = document.getElementById(`track-${track.index}`);
      if (canvas) {
        drawTrack(canvas, track.notes, track.color, duration);
      }
    });
  }, [tracks]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">🎼 Multi-Track Piano Roll</h2>
      <FileInput onChange={handleFileUpload}/>
      {midiName && <div className="mb-2">Loaded: {midiName}</div>}

      <div style={{ position: 'relative', overflowX: 'auto', border: '1px solid #ccc' }}>
        {tracks.map((track, i) => (
          <div key={i} className="mb-2">
            <div className="font-semibold text-sm mb-1">{track.name}</div>
            <div style={{ position: 'relative' }}>
              <canvas id={`track-${track.index}`} style={{ display: 'block' }} />
             
              <div
                key={i}
                ref={(el) => (cursorRefs.current[i] = el)} 
                style={{
                  position: "absolute",
                  top: `${i * 30}px`, // Separate cursors for each track
                  left: "0px",
                  width: "2px",
                  height: "704px",
                  backgroundColor: "red",
                  display: "none",
                }}
              />
              
            </div>
          </div>
        ))}
      </div>
      <div style={buttonContainerStyles}>
      {tracks.length > 0 && (
        <Button
        label="▶ Play"
          onClick={play}
        />
      )}
      <Button
      label='💾 Export MIDI'
        onClick={() => exportToMidi(tracks, 0)}
        />
        <Button
        label='🎤 Export WAV'
        onClick={() => exportToWav(tracks)}
      />
      </div>
        
    </div>
  );
};

export default withContainer(PianoRollVisualizer);
