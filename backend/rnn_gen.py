from music21 import converter, note, chord, stream

def get_notes_from_midi(file_path):
    midi = converter.parse(file_path)
    notes = []
    for element in midi.flat.notes:
        if isinstance(element, note.Note):
            notes.append(str(element.pitch))
        elif isinstance(element, chord.Chord):
            notes.append('.'.join(str(n) for n in element.normalOrder))
    return notes

notes = get_notes_from_midi("moonlight_sonata.mid")
print(notes[:50])  # Show first 50 notes/chords

sequence_length = 100
pitchnames = sorted(set(notes))
note_to_int = {note: num for num, note in enumerate(pitchnames)}

input_sequences = []
output_notes = []

for i in range(len(notes) - sequence_length):
    seq_in = notes[i:i + sequence_length]
    seq_out = notes[i + sequence_length]
    input_sequences.append([note_to_int[n] for n in seq_in])
    output_notes.append(note_to_int[seq_out])

import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dropout, Dense

X = np.reshape(input_sequences, (len(input_sequences), sequence_length, 1)) / float(len(pitchnames))
y = np.eye(len(pitchnames))[output_notes]

model = Sequential([
    LSTM(512, input_shape=(X.shape[1], X.shape[2]), return_sequences=True),
    Dropout(0.3),
    LSTM(512),
    Dense(256, activation='relu'),
    Dense(len(pitchnames), activation='softmax')
])

model.compile(loss='categorical_crossentropy', optimizer='adam')
model.fit(X, y, epochs=20, batch_size=64)


import random

start = random.randint(0, len(input_sequences)-1)
pattern = input_sequences[start]
generated_notes = []

for _ in range(300):  # Generate 300 notes
    input_seq = np.reshape(pattern, (1, len(pattern), 1)) / float(len(pitchnames))
    prediction = model.predict(input_seq, verbose=0)
    index = np.argmax(prediction)
    result = pitchnames[index]
    generated_notes.append(result)

    pattern.append(index)
    pattern = pattern[1:]  # Shift window

from music21 import instrument, note, chord, stream

def create_midi_from_notes(notes, output_file):
    output = stream.Stream()
    offset = 0

    for pattern in notes:
        if '.' in pattern or pattern.isdigit():
            chord_notes = [note.Note(int(n)) for n in pattern.split('.')]
            new_chord = chord.Chord(chord_notes)
            new_chord.offset = offset
            output.append(new_chord)
        else:
            new_note = note.Note(pattern)
            new_note.offset = offset
            output.append(new_note)
        offset += 0.5

    output.write('midi', fp=output_file)

create_midi_from_notes(generated_notes, "moonlight_variation_ai.mid")


