import React, {useState} from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MusicEditorDemo from './components/DemoApp';
import MidiVisualizer from './components/MidiReader';
import MidiPlayer from './components/MidiPlayer';
import PianoRollVisualizer from './components/PianoVisualizer';
import Navbar from './components/Navbar';
import NotFound from './components/NotFound';

function App() {

  return (
    <div>
      <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<PianoRollVisualizer />} />
        <Route path="/demo" element={<MusicEditorDemo />} />
        <Route path="/visualizer" element={<MidiVisualizer />} />
        <Route path="/player" element={<MidiPlayer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
