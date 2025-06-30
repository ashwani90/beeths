import { Midi } from '@tonejs/midi';
import { saveAs } from 'file-saver'; // install via: npm install file-saver
import { PIXELS_PER_SECOND, NOTE_HEIGHT } from '../constants/music';
import { midiToNoteName } from './midi';

export const groupByInstrument = (notes) => {
    const map = {};
    notes.forEach(note => {
      const key = note.track + '-' + note.instrument;
      if (!map[key]) {
        map[key] = {
          instrument: note.instrument,
          track: note.track,
          notes: []
        };
      }
      map[key].notes.push(note);
    });
    return Object.values(map);
  };


  
  export const exportToMidi = (tracks) => {
    const midi = new Midi();
  
    // Loop through each track
    tracks.forEach((track, trackIndex) => {
      const midiTrack = midi.addTrack();
      midiTrack.name = track.name || `Track ${trackIndex + 1}`;
      midiTrack.channel = trackIndex % 16; // MIDI supports 16 channels (0–15)
  
      // Add notes to the track
      track.notes.forEach(note => {
        midiTrack.addNote({
          midi: note.midi,
          time: note.time,
          duration: note.duration,
          velocity: note.velocity ?? 0.8, // Default if not provided
        });
      });
    });
  
    // Convert MIDI to a Blob and save
    const bytes = midi.toArray();
    const blob = new Blob([bytes], { type: 'audio/midi' });
    saveAs(blob, 'exported_song.mid');
  };
  

  export const drawTrack = (canvas, notes, color, duration) => {
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
      const lowestTime = notes.reduce((min, note) => Math.min(min, note.time), Infinity);
      console.log("Lowest time:", lowestTime);
      notes.forEach(note => {
        const x = note.time * PIXELS_PER_SECOND - lowestTime * PIXELS_PER_SECOND; // Adjust x position based on lowest time
        const y = (maxPitch - note.midi) * NOTE_HEIGHT;
        const w = (note.duration * PIXELS_PER_SECOND);
        const h = NOTE_HEIGHT;
        console.log("x is ", x);
    
        // Draw the note rectangle
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    
        // Draw the note label
        ctx.fillStyle = 'black';
  
        const label = midiToNoteName(note.midi);
        console.log(label);
        if (!unique_notes.includes(label)) {
          unique_notes.push(label);
          }
        ctx.fillText(label, x + 2, y + h / 2); // small padding inside the box
      });
      console.log(unique_notes);
    };