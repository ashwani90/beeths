from transformers import AutoTokenizer, AutoModelForCausalLM
from miditok import REMI
from miditoolkit import MidiFile

# Step 1: Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("m-a-p/music2vec-v1")
model = AutoModelForCausalLM.from_pretrained("m-a-p/music2vec-v1")

# Step 2: Define a text-based prompt (optional)
prompt = "<PAD> <Bar> <Position_1/16> <Note-On_60> <Velocity_80> <Duration_1/8>"  # C4 note
input_ids = tokenizer(prompt, return_tensors="pt").input_ids

# Step 3: Generate MIDI token sequence
output = model.generate(
    input_ids=input_ids,
    max_length=256,
    temperature=1.0,
    top_k=50,
    top_p=0.95,
    do_sample=True,
    num_return_sequences=1
)

# Step 4: Convert token IDs to token strings
generated_tokens = tokenizer.batch_decode(output, skip_special_tokens=True)[0]
token_list = generated_tokens.strip().split()
print("Generated Tokens:", token_list[:30])  # Show first 30 tokens

# Step 5: Convert tokens to MIDI using Miditok REMI
remi_tokenizer = REMI()  # default config
midi_obj = remi_tokenizer.tokens_to_midi(token_list)
midi_obj.dump("generated_output.mid")
print("Saved: generated_output.mid")
