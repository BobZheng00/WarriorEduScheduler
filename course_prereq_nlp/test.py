from transformers import GPTNeoForCausalLM, GPT2Tokenizer

# Assuming you chose checkpoint-12
model_path = "./result/checkpoint-12"
model = GPTNeoForCausalLM.from_pretrained(model_path)

tokenizer = GPT2Tokenizer.from_pretrained("EleutherAI/gpt-neo-1.3B")


def generate_text(prompt):
    # Encode the prompt text
    inputs = tokenizer.encode(prompt, return_tensors="pt")

    # Generate outputs
    outputs = model.generate(inputs, max_length=2000)  # Adjust max_length as needed

    # Decode and print the output text
    text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return text


# Example usage
prompt = """
The course prerequisites for the course "Introduction to Python" are:
"""

print(generate_text(prompt))
