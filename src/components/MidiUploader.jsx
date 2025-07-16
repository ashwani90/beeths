import React, { useState } from 'react';

const MidiUploader = () => {
  const [midiFile, setMidiFile] = useState(null);
  const [responseJson, setResponseJson] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setMidiFile(e.target.files[0]);
    setResponseJson(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!midiFile) {
      setError('Please select a MIDI file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', midiFile);

    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:5000/upload-midi', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      setResponseJson(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

//   Here we can show reponse as piano keys, duration will control the width of keys
// Round off duration as well
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Upload MIDI File</h2>
      <input type="file" accept=".mid,.midi" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {responseJson && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Response IN Keys</h3>
           
          <pre style={{ backgroundColor: '#f0f0f0', padding: '1rem' }}>
            {JSON.stringify(responseJson, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MidiUploader;
