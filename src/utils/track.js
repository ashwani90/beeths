import { Midi } from '@tonejs/midi';
import { saveAs } from 'file-saver'; // install via: npm install file-saver

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


  
  export const exportToMidi = (tracks, index=0) => {
    const midi = new Midi();
  
    tracks.forEach((track, index) => {
      const midiTrack = midi.addTrack();
      midiTrack.name = track.name || `Track ${index + 1}`;
      midiTrack.channel = index % 16; // MIDI has 16 channels (0–15)
  
      track.notes.forEach(note => {
        if (index==0) {
          midiTrack.addNote({
            midi: note.midi,
            time: note.time,
            duration: note.duration,
            velocity: note.velocity ?? 0.8, // Default if not set
          });
        } else {
          let target = parseInt(note.time/10);
          if (target == index) {
            midiTrack.addNote({
              midi: note.midi,
              time: note.time,
              duration: note.duration,
              velocity: note.velocity ?? 0.8, // Default if not set
            });
          }
        }
        
      });
    });
  
    const bytes = midi.toArray();
    const blob = new Blob([bytes], { type: 'audio/midi' });
    saveAs(blob, 'exported_song.mid');
  };
  