from flask import Flask, request, jsonify
import pretty_midi
import tempfile
import os
from helpers.midi_helper import midi_to_json

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/convert-audio', methods=['POST'])
def convert_to_audio():
    # Placeholder for audio conversion logic
    pass

@app.route('/upload-midi', methods=['POST'])
def upload_midi():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not file.filename.lower().endswith('.mid') and not file.filename.lower().endswith('.midi'):
        return jsonify({'error': 'File is not a MIDI file'}), 400

    # Save to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mid") as tmp:
        file.save(tmp.name)
        midi_data = pretty_midi.PrettyMIDI(tmp.name)
        os.unlink(tmp.name)

    notes_json = midi_to_json(midi_data)
    return jsonify(notes_json)

if __name__ == '__main__':
    app.run(debug=True)
