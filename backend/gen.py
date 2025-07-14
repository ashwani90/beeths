from midiutil import MIDIFile
import random

# Create MIDI file with 1 track
track = 0
channel = 0
time = 0
tempo = 90
volume = 100

mf = MIDIFile(1)
mf.addTempo(track, time, tempo)

# C minor scale motifs
themes = [
    [60, 63, 67, 72],       # C minor arpeggio
    [67, 65, 63, 60],       # Descending dramatic line
    [60, 62, 63, 62, 60],   # Ornamentation
    [60, 63, 65, 63, 60],   # Stepwise chromatic motion
    [72, 70, 68, 67, 65],   # High drama descent
]

# Generate 16 phrases with variations
for i in range(16):
    motif = random.choice(themes)
    offset = random.choice([0, 0, 2, -2, 5])
    duration = random.choice([0.5, 1])
    for note in motif:
        pitch = note + offset
        mf.addNote(track, channel, pitch, time, duration, volume)
        time += duration

# Save file
with open("beethoven_extended.mid", "wb") as f:
    mf.writeFile(f)

print("Generated 'beethoven_extended.mid'")


# from midiutil import MIDIFile

# mf = MIDIFile(1)
# mf.addTempo(0, 0, 90)

# # Example motif: C minor arpeggio
# motif = [60, 63, 67, 72]
# time = 0
# for _ in range(4):
#     for note in motif:
#         mf.addNote(0, 0, note, time, 1, 100)
#         time += 1

# with open("beethoven_style.mid", "wb") as f:
#     mf.writeFile(f)


