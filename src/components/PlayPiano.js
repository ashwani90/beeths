import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

export default function PianoButton() {
  const samplerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log("🔄 Initializing Sampler...");

    const sampler = new Tone.Sampler({
      urls: {
        C4: "/samples/C4.mp3", // this will be resolved as public/samples/piano/C4.wav
      },
      onload: () => {
        console.log("✅ Sampler loaded");
        setIsLoaded(true);
      },
      onerror: (e) => {
        console.error("❌ Sampler failed", e);
      },
    }).toDestination();

    samplerRef.current = sampler;
  }, []);

  const playNote = async () => {
    await Tone.start(); // Unlock audio context on first gesture
    if (!isLoaded || !samplerRef.current) {
      console.warn("Sampler not ready");
      return;
    }

    samplerRef.current.triggerAttackRelease("C4", "2n", undefined, 0.9); // Play note
  };

  return (
    <div>
      <button onClick={playNote} disabled={!isLoaded}>
        {isLoaded ? "Play Piano" : "Loading..."}
      </button>
    </div>
  );
}
