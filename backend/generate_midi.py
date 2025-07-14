from midiutil import MIDIFile
import random

# Create a single-track MIDI file
track = 0
channel = 0
time = 0      # Start time
tempo = 120   # BPM
volume = 100  # Volume: 0-127

mf = MIDIFile(1)     # One track
mf.addTempo(track, time, tempo)

# Define a simple Beethoven-like motif using the C minor scale (C, D, Eb, F, G, Ab, Bb)
motif = [60, 63, 67, 72]  # C4, Eb4, G4, C5

# Add motif and variations to create a short passage
for i in range(8):  # 8 repetitions with variation
    offset = random.choice([0, 2, 4, -2])  # small transpositions
    duration = random.choice([1, 0.5])     # quarter or eighth notes
    for note in motif:
        pitch = note + offset
        mf.addNote(track, channel, pitch, time, duration, volume)
        time += duration

# Save the MIDI file
with open("beethoven_style.mid", "wb") as f:
    mf.writeFile(f)

print("MIDI file saved as beethoven_style.mid")
