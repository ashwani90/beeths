import pretty_midi
# Need to check this out more does not work that good
midi = pretty_midi.PrettyMIDI("moonlight_sonata.mid")
piano = midi.instruments[0]  # Usually piano is the first track


notes = piano.notes
print(f"Total notes: {len(notes)}")
for note in notes[:10]:
    print(f"Pitch: {note.pitch}, Start: {note.start:.2f}, End: {note.end:.2f}")


for note in notes:
    note.pitch += 2  # transpose up by a whole tone

pivot = 60
for note in notes:
    interval = note.pitch - pivot
    note.pitch = pivot - interval


start_time = notes[0].start
end_time = notes[-1].end
reversed_notes = []

for note in reversed(notes):
    new_start = end_time - (note.end - start_time)
    new_end = new_start + (note.end - note.start)
    reversed_notes.append(pretty_midi.Note(velocity=note.velocity, pitch=note.pitch,
                                           start=new_start, end=new_end))

piano.notes = reversed_notes

for note in notes:
    duration = note.end - note.start
    new_duration = duration * 1.5  # stretch
    note.end = note.start + new_duration

midi.write("moonlight_variation.mid")
print("Saved variation as moonlight_variation.mid")

# Transpose, then invert, then stretch
for note in notes:
    note.pitch = 60 - (note.pitch - 60) + 2
    note.end = note.start + (note.end - note.start) * 1.2

