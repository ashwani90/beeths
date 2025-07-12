import React, { useRef } from 'react';

function DraggableNote({ note, minMidi, onDrag, onNoteClick }) {
    const ref = useRef(null);
    const resizing = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
  
    const handleMouseDown = (e, isResize = false) => {
      resizing.current = isResize;
      startPos.current = { x: e.clientX, y: e.clientY };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };
  
    const onMouseMove = (e) => {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      onDrag(dx, dy, resizing.current);
      startPos.current = { x: e.clientX, y: e.clientY };
    };
  
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  
    const top = (note.midi - minMidi) * 20;
    const left = note.time * 100;
    const width = note.duration * 100;
  
    return (
      <div
        ref={ref}
        style={{
          position: 'absolute',
          top: top,
          left: left,
          width: width,
          height: '18px',
          backgroundColor: `rgba(30, 144, 255, ${note.velocity})`,
          border: '1px solid #0077cc',
          borderRadius: '4px',
          cursor: 'move',
          userSelect: 'none',
        }}
        onClick={() => onNoteClick(note.id)}
        // onMouseDown={(e) => handleMouseDown(e, false)}
      >
        <div
          style={{
            position: 'absolute',
            right: 0,
            width: '6px',
            height: '100%',
            backgroundColor: 'white',
            cursor: 'ew-resize',
          }}
          // onMouseDown={(e) => {
          //   e.stopPropagation();
          //   handleMouseDown(e, true);
          // }}
        />
      </div>
    );
  }

  export default DraggableNote;