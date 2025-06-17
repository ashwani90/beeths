import * as Tone from 'tone';
import { useEffect, useState } from 'react';

const usePianoSampler = () => {
  const [sampler, setSampler] = useState(null);

  useEffect(() => {
    console.log('🔄 Initializing Piano Sampler...');
    const piano = new Tone.Sampler({
        
      urls: {
        // "A#2": window.location.origin + '/samples/test/A#2.wav',
        //  "C#1": window.location.origin + '/samples/test/C#1.wav',
        // "D#0": window.location.origin + '/samples/test/D#0.wav',
        "B#1": window.location.origin + '/samples/test/B#1.wav',
        // "G#2": window.location.origin + '/samples/test/G#2.wav',
        //  "G#4": window.location.origin + '/samples/test/G#4.wav',
        // "C#4": window.location.origin + '/samples/test/C#5.wav',
        A0: window.location.origin + '/samples/test/A0.wav',
        A1: window.location.origin + '/samples/test/A1.wav', 
        A2: window.location.origin + '/samples/test/A2.wav',
        A3: window.location.origin + '/samples/test/A3.wav',
        A4: window.location.origin + '/samples/test/A4.wav',
        A5: window.location.origin + '/samples/test/A5.wav',
        B0: window.location.origin + '/samples/test/B0.wav',
        B1: window.location.origin + '/samples/test/B1.wav',
        B2: window.location.origin + '/samples/test/B2.wav',
        B3: window.location.origin + '/samples/test/B3.wav',
        B4: window.location.origin + '/samples/test/B4.wav',
        C2: window.location.origin + '/samples/test/C2.wav',
        C3: window.location.origin + '/samples/test/C3.wav',
        C4: window.location.origin + '/samples/test/C4.wav',
        D1: window.location.origin + '/samples/test/D1.wav',
        D2: window.location.origin + '/samples/test/D2.wav',
        D3: window.location.origin + '/samples/test/D3.wav',
        D4: window.location.origin + '/samples/test/D4.wav',
        D5: window.location.origin + '/samples/test/D5.wav',
        // E0: window.location.origin + '/samples/test/E0.wav',
        E1: window.location.origin + '/samples/test/E1.wav',
        E2: window.location.origin + '/samples/test/E2.wav',
        E3: window.location.origin + '/samples/test/E3.wav',
        E4: window.location.origin + '/samples/test/C4.wav',
        E5: window.location.origin + '/samples/test/E5.wav',
        F0: window.location.origin + '/samples/test/F0.wav',
        F1: window.location.origin + '/samples/test/F1.wav',
        F2: window.location.origin + '/samples/test/F2.wav',
        F3: window.location.origin + '/samples/test/F3.wav',
        F4: window.location.origin + '/samples/test/F4.wav',
        F5: window.location.origin + '/samples/test/F5.wav',
        G0: window.location.origin + '/samples/test/G0.wav',
        G1: window.location.origin + '/samples/test/G1.wav',
        G2: window.location.origin + '/samples/test/G2.wav',
        G3: window.location.origin + '/samples/test/G3.wav',
        G4: window.location.origin + '/samples/test/G4.wav',
        G5: window.location.origin + '/samples/test/G5.wav',
      },
      release: 1,
    //   baseUrl: window.location.origin + '/samples/test/', // Ensure this matches your server setup
      onload: () => {
        console.log('🎹 Piano FLAC samples loaded');
        setSampler(piano);
      },
      onerror: (err) => {
        console.error("❌ Player load error:", err);
      },
    }).toDestination();
  }, []);

  return sampler;
};

export default usePianoSampler;
