import React from 'react';
import { groupByInstrument } from '../utils/track';
import DraggableNote from './DraggableNote';
import renderTimeAxis from "../utils/ticks";

const renderPianoRoll = (notes, handleDrag) => {
    const groupedTracks = groupByInstrument(notes);
  
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {groupedTracks.map((group, index) => {
          const maxTime = Math.max(...group.notes.map(n => n.time + n.duration));
          const minMidi = Math.min(...group.notes.map(n => n.midi));
          const maxMidi = Math.max(...group.notes.map(n => n.midi));
  
          return (
            <div key={index}>
              <h4 style={{ padding: "20px", borderBottom: "1px solid black" }}>
                {group.instrument} (Track {group.track + 1})
              </h4>
  
              {/* Time Axis */}
              <div
                style={{
                  position: 'relative',
                  height: '20px',
                  width: maxTime * 100 + 'px',
                  marginLeft: '20px',
                }}
              >
                {renderTimeAxis(maxTime)}
              </div>
  
              {/* Notes */}
              <div
                style={{
                  position: 'relative',
                  width: maxTime * 100 + 'px',
                  height: (maxMidi - minMidi + 1) * 20 + 'px',
                  padding: "20px",
                  border: '1px solid #ccc',
                  backgroundColor: '#fafafa',
                }}
              >
                {group.notes.map(note => (
                  <DraggableNote
                    key={note.id}
                    note={note}
                    minMidi={minMidi}
                    onDrag={(dx, dy, isResize) =>
                      handleDrag(note.id, dx, dy, isResize)
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  export default renderPianoRoll;