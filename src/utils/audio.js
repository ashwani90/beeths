import * as Tone from 'tone';


const exportToAudio = async (tracks, midiName, recorder) => {

    
    await Tone.start();

    // Prepare the recorder
    recorder.current.start();

    // Play notes
    const synth = new Tone.PolySynth().connect(recorder.current);
    const now = Tone.now();
    tracks.forEach((track) => {
      track.notes.forEach((note) => {
        synth.triggerAttackRelease(
          Tone.Frequency(note.midi, 'midi'),
          note.duration,
          now + note.time
        );
      });
    });

    // Wait for the playback to finish
    Tone.Transport.start();
    await Tone.Transport.pause("+1"); // Ensure buffer finalization
    const recording = await recorder.current.stop();

    // Create a WAV blob
    const blob = new Blob([recording], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);

    // Download the WAV file
    const link = document.createElement('a');
    link.href = url;
    link.download = `${midiName || 'output'}.wav`;
    link.click();
    URL.revokeObjectURL(url);
  };

  export default exportToAudio;
  