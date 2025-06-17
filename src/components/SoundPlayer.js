import Soundfont from 'soundfont-player';

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const instruments = {
  piano: null,
  violin: null,
  drums: null,
};

// Load instruments
async function loadInstruments() {
  instruments.piano = await Soundfont.instrument(audioContext, 'acoustic_grand_piano');
  instruments.violin = await Soundfont.instrument(audioContext, 'violin');
  instruments.drums = await Soundfont.instrument(audioContext, 'drumset'); // drums may require custom handling
}
loadInstruments();

// Play a note
function playNote(instrument, midiNumber, duration) {
  if (!instruments[instrument]) return;
  const player = instruments[instrument];
  const node = player.play(midiNumber);
  setTimeout(() => node.stop(), duration * 1000);
}