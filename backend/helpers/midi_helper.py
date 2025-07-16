import pretty_midi

def json_to_pretty_midi(data):
    midi = pretty_midi.PrettyMIDI()

    for instr_data in data['instruments']:
        program = instr_data.get('program', 0)
        is_drum = instr_data.get('is_drum', False)
        instrument = pretty_midi.Instrument(program=program, is_drum=is_drum)

        for note_data in instr_data['notes']:
            note = pretty_midi.Note(
                velocity=note_data['velocity'],
                pitch=note_data['pitch'],
                start=note_data['start'],
                end=note_data['end']
            )
            instrument.notes.append(note)

        midi.instruments.append(instrument)

    return midi

def midi_to_json(midi_data):
    result = []
    for instrument in midi_data.instruments:
        for note in instrument.notes:
            result.append({
                'pitch': note.pitch,
                'note_name': pretty_midi.note_number_to_name(note.pitch),
                'start': note.start,
                'end': note.end,
                'duration': note.end - note.start,
                'velocity': note.velocity,
                'instrument': instrument.name if instrument.name else f"Program {instrument.program}",
                'is_drum': instrument.is_drum
            })
    return result