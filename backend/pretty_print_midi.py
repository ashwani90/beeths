from mido import MidiFile

def midi_to_note_name(midi_note):
    if not (0 <= midi_note < 128):
        return 1
    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    return notes[midi_note % 12] + str(midi_note // 12 - 1)

def pretty_print_midi_notes(file_path):
    midi = MidiFile(file_path)
    print(f"Loaded '{file_path}' with {len(midi.tracks)} track(s)\n")
    final_message = ''
    for i, track in enumerate(midi.tracks):
        print(f"Track {i}: {track.name}")
        time = 0
        for msg in track:
            time += msg.time
            if hasattr(msg, 'note'):
                note_name = midi_to_note_name(msg.note)
            else:
                note_name = "N/A"
                
            if msg.type == 'note_on' and msg.velocity > 0:
                final_message += f"At {time:6} pressed {note_name:3} vel {msg.velocity:3} ||"
            #     print(f"  Time: {time:6} | Note On  | Note: {note_name:3} | Velocity: {msg.velocity:3}")
            # elif msg.type == 'note_off' or (msg.type == 'note_on' and msg.velocity == 0):
            #     print(f"  Time: {time:6} | Note Off | Note: {note_name:3}")
    print(final_message)

# Example usage
pretty_print_midi_notes("storage/moonlight_sonata.mid")
