import { useState, useRef, useEffect } from "react";
import * as Tone from 'tone';
import { urlsObj } from '../data/notesUrl';


// TODO:: COntrol velocity of the track
const usePlayNotes = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const pianoSampler = useRef(null);

  useEffect(() => {
    pianoSampler.current = new Tone.Sampler({
      urls: urlsObj,
    }).toDestination();
  }, []);

  const playNotes = async (notes) => {
    if (isPlaying) return; // Prevent multiple playbacks
    setIsPlaying(true);
    await Tone.start();

    const now = Tone.now();
    notes.forEach((note) => {
      pianoSampler.current.triggerAttackRelease(
        Tone.Frequency(note.midi, "midi"),
        note.duration,
        now + note.time
      );
    });

    // Stop playback after the last note
    const playbackDuration = Math.max(
      ...notes.map((note) => note.time + note.duration)
    );
    setTimeout(() => setIsPlaying(false), playbackDuration * 1000);
  };

  return { isPlaying, playNotes };
};

export default usePlayNotes;
