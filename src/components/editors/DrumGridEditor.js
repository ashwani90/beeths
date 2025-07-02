import React, {useState} from 'react';
import { DRUM_STEPS, DRUM_NOTES } from '../../constants/music';
import { midiToNoteName } from '../../utils/midi';

function DrumGridEditor({ drumNotes, onUpdateDrumNotes, playingStep }) {
    const [velocity, setVelocity] = useState(0.7);
  
    function toggleStep(midi, step) {
      const found = drumNotes.find((n) => n.midi === midi && n.step === step);
      if (found) {
        onUpdateDrumNotes(drumNotes.filter((n) => !(n.midi === midi && n.step === step)));
      } else {
        onUpdateDrumNotes([...drumNotes, { midi, step, velocity }]);
      }
    }
  
    return (
      <div>
        <h3>Drum Grid Editor</h3>
        <div style={{ marginBottom: 10 }}>
          <label>Velocity: </label>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={velocity}
            onChange={(e) => setVelocity(parseFloat(e.target.value))}
          />
        </div>
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Instrument</th>
              {[...Array(DRUM_STEPS).keys()].map((step) => (
                <th key={step} style={{ border: '1px solid black', padding: 5 }}>
                  {step + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DRUM_NOTES.map((midi) => (
              <tr key={midi}>
                <td style={{ border: '1px solid black', padding: 5 }}>{midiToNoteName(midi)}</td>
                {[...Array(DRUM_STEPS).keys()].map((step) => {
                  const active = drumNotes.find((n) => n.midi === midi && n.step === step);
                  return (
                    <td
                      key={step}
                      style={{
                        border: '1px solid black',
                        padding: 5,
                        cursor: 'pointer',
                        backgroundColor: active ? `rgba(102, 178, 155, ${active.velocity})` : '#fff',
                      }}
                      onClick={() => toggleStep(midi, step)}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

export default DrumGridEditor;