import React, { useEffect, useState, useRef } from 'react';
import { instrumentColors } from '../../data/colors';
import { NOTE_HEIGHT_EDITOR, KEY_WIDTH, PIANO_KEYS } from '../../constants/music';
import { midiToNoteName  } from '../../utils/midi';

function PianoRollEditor({ notes, selectedInstrument, onUpdateNotes, playingNotes, onNoteClick }) {
    const canvasRef = useRef(null);
    const keyCanvasRef = useRef(null);
    const [noteRects, setNoteRects] = useState([]);
    const scrollRef = useRef(null);
    const pianoKeyScrollRef = useRef(null);
    const timeCanvasRef = useRef(null);

    useEffect(() => {
      const scrollEl = scrollRef.current;
      const pianoEl = pianoKeyScrollRef.current;

      const handleScroll = () => {
        pianoEl.scrollTop = scrollEl.scrollTop;
      };

      scrollEl.addEventListener('scroll', handleScroll);

      return () => {
        scrollEl.removeEventListener('scroll', handleScroll);
      };
    }, []);
  
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
      let width = canvasRef.current.width;
      const height = canvasRef.current.height;

      const keyCanvas = keyCanvasRef.current;
      keyCanvas.height = PIANO_KEYS * NOTE_HEIGHT_EDITOR;
  
      ctx.clearRect(0, 0, width, height);
  
      const keyCtx = keyCanvas.getContext('2d');
      keyCtx.clearRect(0, 0, keyCanvas.width, keyCanvas.height);

      for (let i = 0; i < PIANO_KEYS; i++) {
        const midiNote = 21 + i;
        const y = keyCanvas.height - (i + 1) * NOTE_HEIGHT_EDITOR;
        const isBlackKey = [1, 3, 6, 8, 10].includes(midiNote % 12);
        keyCtx.fillStyle = isBlackKey ? '#444' : '#eee';
        keyCtx.fillRect(0, y, KEY_WIDTH, NOTE_HEIGHT_EDITOR);
        keyCtx.strokeStyle = 'cyan';
        keyCtx.strokeRect(0, y, KEY_WIDTH, NOTE_HEIGHT_EDITOR);

        keyCtx.fillStyle = 'black';
        keyCtx.font = '10px Arial';
        keyCtx.fillText(midiToNoteName(midiNote), 5, y + 14);
      }
  
      // Draw notes
      const timeScale = 200;
      // 1. Determine the maximum time extent of notes
      const maxEndTime = Math.max(...notes.map(n => n.time + n.duration), 0);
      const requiredWidth = KEY_WIDTH + maxEndTime * timeScale + 100; // Extra padding
      if (canvasRef.current.width < requiredWidth) {
        canvasRef.current.width = requiredWidth;
      }
      width = canvasRef.current.width;
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
      setCanvasWidth(width);
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
      <>
      <div
        ref={scrollRef}
        style={{ overflowX: 'auto' }}
        onScroll={(e) => {
          timeCanvasRef.current.scrollLeft = e.target.scrollLeft;
        }}
      >
        <canvas
          ref={timeCanvasRef}
          width={canvasWidth}
          height={TIME_HEIGHT}
          style={{ display: 'block' }}
        />
      </div>
      <div style={{ display: 'flex', width: '70vw' }}>
      {/* Piano Keys (vertically scrollable) */}
      
        <canvas
          ref={keyCanvasRef}
          width={KEY_WIDTH}
          height={PIANO_KEYS * NOTE_HEIGHT_EDITOR}
          style={{ position: 'sticky', left: 0, zIndex: 2 }}
        />
      </div>

      {/* Notes (both scrollable) */}
      <div
        ref={scrollRef}
        style={{
          height: '400px',
          overflowY: 'auto',
          overflowX: 'auto',
          width: '80%'
        }}
      >
        <canvas
          ref={canvasRef}
          height={PIANO_KEYS * NOTE_HEIGHT_EDITOR}
          style={{ cursor: 'pointer' }}
          onClick={handleMouseClick}
        />
      </div>
    </>
    );
  }

  export default PianoRollEditor;