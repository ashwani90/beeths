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
  