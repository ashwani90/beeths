import React, { useEffect, useState, useRef } from 'react';
import { instrumentColors } from '../../data/colors';
import { NOTE_HEIGHT_EDITOR, KEY_WIDTH, PIANO_KEYS } from '../../constants/music';
import { midiToNoteName  } from '../../utils/midi';

function PianoRollEditor({ notes, selectedInstrument, onUpdateNotes, playingNotes, onNoteClick }) {
    const canvasRef = useRef(null);
    const [noteRects, setNoteRects] = useState([]);
  
    const handleMouseClick = (event) => {
      if (handleClick(event)) {
        return;
      }
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
  
      const midiNote = 21 + Math.floor((canvas.height - mouseY) / NOTE_HEIGHT_EDITOR);
      const startTime = (mouseX - KEY_WIDTH) / 200; // 200 is the time scale factor
      const duration = 0.5; // Default duration for a new note
  
      if (startTime >= 0 && midiNote >= 21 && midiNote <= 108) {
        let time = startTime;
        onUpdateNotes([
          ...notes,
          {
            id: midiNote + '-' + time + '-' + duration,
            midi: midiNote,
            time,
            duration,
            instrument: selectedInstrument,
          },
        ]);
      }
    };
  
    useEffect(() => {
      const ctx = canvasRef.current.getContext('2d');
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
  
      ctx.clearRect(0, 0, width, height);
  
      // Draw piano keys vertically
      for (let i = 0; i < PIANO_KEYS; i++) {
        const midiNote = 21 + i;
        const y = height - (i + 1) * NOTE_HEIGHT_EDITOR;
        const isBlackKey = [1, 3, 6, 8, 10].includes(midiNote % 12);
        ctx.fillStyle = isBlackKey ? '#444' : '#eee';
        ctx.fillRect(0, y, KEY_WIDTH, NOTE_HEIGHT_EDITOR);
        ctx.strokeStyle = 'cyan';
        ctx.strokeRect(0, y, KEY_WIDTH, NOTE_HEIGHT_EDITOR);
  
        if (playingNotes.includes(midiNote)) {
          ctx.fillStyle = 'yellow';
          ctx.fillRect(0, y, KEY_WIDTH, NOTE_HEIGHT_EDITOR);
        }
  
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.fillText(midiToNoteName(midiNote), 5, y + 14);
      }
  
      // Draw notes
      const timeScale = 200;
      const rects = [];
      notes.forEach(({ midi, time, duration, instrument, id }) => {
        const x = KEY_WIDTH + time * timeScale;
        const y = height - (midi - 21 + 1) * NOTE_HEIGHT_EDITOR;
        const width = duration * timeScale;
        // id = "" + x + '' + y + width + NOTE_HEIGHT_EDITOR;
  
        ctx.fillStyle = instrumentColors[instrument] || 'gray';
        ctx.fillRect(x, y, width, NOTE_HEIGHT_EDITOR - 2);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(x, y, width, NOTE_HEIGHT_EDITOR - 2);
        rects.push({ id, x, y, w: width, h: NOTE_HEIGHT_EDITOR})
      });
      setNoteRects(rects);
    }, [notes, playingNotes]);

    const handleClick = (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
  
      for (const { id, x, y, w, h } of noteRects) {

        if (
          mouseX >= x &&
          mouseX <= x + w &&
          mouseY >= y &&
          mouseY <= y + h
        ) {
          onNoteClick(id);
          console.log(`Clicked note ID: ${id}`);
          return true;
        }
      }
      return false; // Return false to indicate no click was handled
    };
  
    return (
      <canvas
        ref={canvasRef}
        width={1000}
        height={PIANO_KEYS * NOTE_HEIGHT_EDITOR}
        style={{ border: '1px solid black', cursor: 'pointer' }}
        onClick={handleMouseClick}
      />
    );
  }

  export default PianoRollEditor;