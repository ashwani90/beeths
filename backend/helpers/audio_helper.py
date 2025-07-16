import pretty_midi
import soundfile as sf          # writes WAV/FLAC/OGG
from pydub import AudioSegment  # optional: converts WAV → MP3
from midi_helper import json_to_pretty_midi

MIDI_PATH   = "storage/moonlight_sonata.mid"
WAV_PATH    = "storage/output.wav"
MP3_PATH    = "storage/output.mp3"
SF2_PATH    = "storage/FluidR3_GM.sf2"  # path to your .sf2 file
SAMPLERATE  = 44100             # 44.1 kHz CD quality

def convert_to_audio(midiData):
    # 1. Load the MIDI file
    midi = json_to_pretty_midi(midiData)  # or use pretty_midi.PrettyMIDI(MIDI_PATH)
    midi = pretty_midi.PrettyMIDI(MIDI_PATH)

    # 2. Synthesize to a NumPy audio array (stereo float32, -1.0…+1.0)
    audio = midi.fluidsynth(fs=SAMPLERATE, sf2_path=SF2_PATH)  # or rely on env var

    # 3. Write to a WAV file
    sf.write(WAV_PATH, audio, SAMPLERATE)
    print(f"WAV written to {WAV_PATH}")

    # 4. (Optional) Convert the WAV to MP3 with pydub / ffmpeg
    try:
        wav_audio = AudioSegment.from_wav(WAV_PATH)
        wav_audio.export(MP3_PATH, format="mp3", bitrate="192k")
        print(f"MP3 written to {MP3_PATH}")
    except Exception as e:
        print("MP3 conversion skipped (pydub/ffmpeg not available):", e)
