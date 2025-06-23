import * as Tone from 'tone';

const playNotesTone = async (notes, pianoSampler, setIsPlaying) => {
    

    await Tone.start();

    const now = Tone.now();

    notes.forEach(({ midi, startTime, duration }) => {
      pianoSampler.current.triggerAttackRelease(
        Tone.Frequency(midi, "midi"),
        duration,
        now + startTime
      );
    });

    // Stop playback after the last note
    const playbackDuration = Math.max(...notes.map((note) => note.startTime + note.duration));
    setTimeout(() => setIsPlaying(false), playbackDuration * 1000);
  };

export default playNotesTone;