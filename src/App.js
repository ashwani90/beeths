import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MusicEditorDemo from './components/DemoApp';
import MidiVisualizer from './components/MidiReader';
import MidiPlayer from './components/MidiPlayer';
import PianoVisualizer from './components/PianoVisualizer';
import Navbar from './components/Navbar';
import NotFound from './components/NotFound';
import MidiUploader from './components/MidiUploader';

function App() {

  return (
    <div>
      <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<PianoVisualizer />} />
        <Route path="/demo" element={<MusicEditorDemo />} />
        <Route path="/visualizer" element={<MidiVisualizer />} />
        <Route path="/uploader" element={<MidiUploader />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
