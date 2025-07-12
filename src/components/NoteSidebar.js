import React, { useState, useEffect } from 'react';
import TextInput from './common/TextInput';
import Button from './common/Button';

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
      paddingLeft: "32px",
      borderLeft: '1px solid #ccc',
      backgroundColor: '#f9f9f9',
    }}>
      <h3>Edit Note</h3>
      <div>
        <label>Note Name:</label>
        <TextInput val={noteData.midi} handleChange={(name, val) => handleChange(name, val)} name='midi'  type="text"/>
      </div>
      <div>
        <label>Time:</label>
        <TextInput val={noteData.time} handleChange={(name, val) => handleChange(name, val)} name='time'  type="number"/>
      </div>
      <div>
        <label>Duration:</label>
        <TextInput val={noteData.duration} handleChange={(name, val) => handleChange(name, val)} name='duration' type="number"/>
      </div>
      <Button label="Save"  onClick={handleSave} />
      <Button label="Cancel" onClick={onClose} style={{ marginLeft: '8px' }}/>
    </aside>
  );
}
