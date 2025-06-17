import MidiWriter from 'midiwriter-js';

// Helper: Convert seconds to MIDI ticks (assuming 480 ticks per quarter note and 120 BPM)
const secondsToTicks = (seconds) => {
  // 120 BPM -> 0.5s per quarter note
  const ticksPerQuarter = 480;
  const quarterNoteDuration = 0.5; // seconds at 120 BPM
  return Math.round((seconds / quarterNoteDuration) * ticksPerQuarter);
};

const exportMidi = () => {
  if (!notesRef.current.length) {
    alert('No notes recorded to export!');
    return;
  }

  const track = new MidiWriter.Track();
  track.setTempo(120);

  // Start time of the first note (in ms) to normalize timing
  const startTime = notesRef.current[0].startTime || performance.now();

  notesRef.current.forEach(note => {
    if (!note.duration) return;

    // Calculate start tick and duration ticks relative to first note
    const startTick = secondsToTicks((note.startTime - startTime) / 1000);
    const durationTick = secondsToTicks(note.duration);

    const midiEvent = new MidiWriter.NoteEvent({
      pitch: [midiToNoteName(note.midi)],
      duration: 'T' + durationTick, // 'T' = ticks
      startTick,
      velocity: Math.round(note.velocity * 127),
    });

    track.addEvent(midiEvent);
  });

  const write = new MidiWriter.Writer(track);
  const midiDataUri = write.dataUri();

  // Create download link
  const link = document.createElement('a');
  link.href = midiDataUri;
  link.download = 'recording.mid';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper: Convert MIDI number to note name (C4=60)
function midiToNoteName(midi) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const note = notes[midi % 12];
  return note + octave;
}
