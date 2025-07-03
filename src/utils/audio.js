import * as Tone from 'tone';
import { urlsObj } from '../data/notesUrl';

// const exportToAudio = async (tracks, midiName, recorder) => {

    
//     await Tone.start();

//     // Prepare the recorder
//     recorder.current.start();

//     // Play notes
//     const synth = new Tone.PolySynth().connect(recorder.current);
//     const now = Tone.now();
//     tracks.forEach((track) => {
//       track.notes.forEach((note) => {
//         synth.triggerAttackRelease(
//           Tone.Frequency(note.midi, 'midi'),
//           note.duration,
//           now + note.time
//         );
//       });
//     });

//     // Wait for the playback to finish
//     Tone.Transport.start();
//     await Tone.Transport.pause("+1"); // Ensure buffer finalization
//     const recording = await recorder.current.stop();

//     // Create a WAV blob
//     const blob = new Blob([recording], { type: 'audio/wav' });
//     const url = URL.createObjectURL(blob);

//     // Download the WAV file
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `${midiName || 'output'}.wav`;
//     link.click();
//     URL.revokeObjectURL(url);
//   };

//   export default exportToAudio;

export async function exportTracksToAudio(tracks, onDone) {
  // Ensure the AudioContext has been resumed after user interaction
  await Tone.start();
  const synth = new Tone.Synth().toDestination();

  // const synth = new Tone.Sampler({
  //   urls: urlsObj,
  //   release: 1,
  // }).toDestination();

  // Wait for sampler to load
  await synth.loaded;

  const context = Tone.getContext().rawContext;
  const dest = context.createMediaStreamDestination();
  const recorder = new MediaRecorder(dest.stream);
  synth.connect(dest);

  const chunks = [];

  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
    const url = URL.createObjectURL(blob);
    onDone(url); // callback with audio URL
  };

  // Schedule notes
  const allNotes = tracks
  .flatMap((track) => track.notes || [])
  .filter((note) =>
    typeof note.midi === 'number' &&
    !isNaN(note.midi) &&
    note.midi >= 0 &&
    note.midi <= 127
  );

  allNotes.forEach((note) => {
    if (
      typeof note.midi !== 'number' ||
      isNaN(note.midi) ||
      note.midi < 0 ||
      note.midi > 127
    ) {
      console.warn('Invalid MIDI note skipped:', note);
      return;
    }
  
    const freq = Tone.Frequency(note.midi, "midi").toFrequency();
    Tone.Transport.schedule((time) => {
      synth.triggerAttackRelease(freq, note.duration, time, note.velocity || 0.7);
    }, note.time);
  });

  const totalDuration = Math.max(...tracks.map(n => n.time + n.duration));

  recorder.start();
  Tone.Transport.start();

  // Stop after the last note
  setTimeout(() => {
    recorder.stop();
    Tone.Transport.stop();
    Tone.Transport.cancel(); // Clear scheduled notes
  }, (totalDuration + 1) * 1000); // extra second to catch reverb tail
}
