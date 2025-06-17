import React, { useState } from 'react';
import PianoKey from './PianoKey';
import NoteCell from './NoteCell';

const numKeys = 24; // 2 octaves
const numBeats = 16;

const PianoRoll = () => {
  const [grid, setGrid] = useState(
    Array(numKeys).fill().map(() => Array(numBeats).fill(false))
  );

  const toggleNote = (keyIndex, beatIndex) => {
    const newGrid = [...grid];
    newGrid[keyIndex][beatIndex] = !newGrid[keyIndex][beatIndex];
    setGrid(newGrid);
  };

  return (
    <div className="piano-roll">
      {grid.map((row, keyIndex) => (
        <div className="piano-row" key={keyIndex}>
          <PianoKey note={keyIndex} />
          {row.map((cell, beatIndex) => (
            <NoteCell
              key={beatIndex}
              active={cell}
              onClick={() => toggleNote(keyIndex, beatIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default PianoRoll;
