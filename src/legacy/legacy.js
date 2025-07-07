export const exportToWav = async () => {
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
}
