import * as Tone from 'tone';
import { useEffect, useState } from 'react';
import { urlsObj } from '../data/notesUrl';

const usePianoSampler = () => {
  const [sampler, setSampler] = useState(null);

  useEffect(() => {
    console.log('🔄 Initializing Piano Sampler...');
    const piano = new Tone.Sampler({
        
      urls: urlsObj,
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
