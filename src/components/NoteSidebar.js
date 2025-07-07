import React, { useState, useEffect } from 'react';

export default function NoteSidebar({ selectedNoteId, notes, setNotes, onClose }) {
  const [noteData, setNoteData] = useState(null);

  useEffect(() => {
    const note = notes.find(n => n.id === selectedNoteId);
    if (note) {
      setNoteData({ ...note });
    }
  }, [selectedNoteId, notes]);

  const handleChange = (field, value) => {
    setNoteData(prev => ({
      ...prev,
      [field]: field === 'time' || field === 'duration' ? parseFloat(value) : value,
    }));
  };

  const handleSave = () => {
    setNotes(prevNotes =>
      prevNotes.map(n =>
        n.id === noteData.id ? { ...noteData } : n
      )
    );
    onClose();
  };

  if (!noteData) return null;

  return (
    <aside style={{
      width: '250px',
      padding: '16px',
      borderLeft: '1px solid #ccc',
      backgroundColor: '#f9f9f9',
    }}>
      <h3>Edit Note</h3>
      <div>
        <label>Note Name:</label>
        <input
          type="text"
          value={noteData.name}
          onChange={e => handleChange('name', e.target.value)}
        />
      </div>
      <div>
        <label>Time:</label>
        <input
          type="number"
          step="0.01"
          value={noteData.time}
          onChange={e => handleChange('time', e.target.value)}
        />
      </div>
      <div>
        <label>Duration:</label>
        <input
          type="number"
          step="0.01"
          value={noteData.duration}
          onChange={e => handleChange('duration', e.target.value)}
        />
      </div>
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose} style={{ marginLeft: '8px' }}>Cancel</button>
    </aside>
  );
}
