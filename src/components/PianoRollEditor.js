import React, { useRef, useEffect, useState } from 'react';

const PITCHES = 60; // e.g. MIDI note range to show (C2 to C7)
const NOTE_HEIGHT = 20;
const PIXELS_PER_SECOND = 100; // scale time axis

export default function PianoRollEditor({ notes, onUpdateNotes }) {
  const canvasRef = useRef(null);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#eee';
    for (let i = 0; i < PITCHES; i++) {
      const y = i * NOTE_HEIGHT;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw notes
    notes.forEach(({ midi, startTime, duration }, idx) => {
      const x = startTime * PIXELS_PER_SECOND;
      const y = (PITCHES - (midi - 36)) * NOTE_HEIGHT; // 36 = C2 base pitch
      const width = duration * PIXELS_PER_SECOND;
      ctx.fillStyle = idx === selectedNoteIndex ? 'orange' : 'blue';
      ctx.fillRect(x, y - NOTE_HEIGHT, width, NOTE_HEIGHT - 2);
    });
  }, [notes, selectedNoteIndex]);

  // Optional: Implement note drag, select, resize handlers here

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={PITCHES * NOTE_HEIGHT}
        style={{ border: '1px solid black', userSelect: 'none' }}
      />
      <p>Click a note to select (drag & edit features coming soon)</p>
    </div>
  );
}
