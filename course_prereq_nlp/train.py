from datasets import load_dataset, DatasetDict
from transformers import GPTNeoForCausalLM, GPT2Tokenizer, Trainer, TrainingArguments
import torch

# Load the dataset
dataset = load_dataset("csv", data_files="dataset/course_prereq.csv")
model = GPTNeoForCausalLM.from_pretrained("EleutherAI/gpt-neo-125m")
tokenizer = GPT2Tokenizer.from_pretrained("EleutherAI/gpt-neo-125m")

# Check if the tokenizer has a pad token, if not, assign one
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token  # Often the EOS token can be used as the pad token

# Splitting the dataset into train and test sets
train_test_split = dataset['train'].train_test_split(test_size=0.1)  # Adjust the test size as needed
dataset = DatasetDict({
    'train': train_test_split['train'],
    'test': train_test_split['test']
})


def tokenize_function(examples):
    # Tokenize inputs and labels
    model_inputs = tokenizer(examples['input'], max_length=512, truncation=True, padding="max_length")
    with tokenizer.as_target_tokenizer():
        labels = tokenizer(examples['output'], max_length=512, truncation=True, padding="max_length")
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs


# Apply tokenization function
dataset = dataset.map(tokenize_function, batched=True)
print(dataset)


def generate_structured_data(description):
    # Encode the input text to tensor
    inputs = tokenizer(description, return_tensors="pt").input_ids

    # Generate output using the model
    with torch.no_grad():  # No need to track gradients
        outputs = model.generate(inputs, max_length=512, num_return_sequences=1)

    # Decode the generated ids to text
    structured_output = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return structured_output


training_args = TrainingArguments(
    output_dir="./result",          # where to save the model
    evaluation_strategy="epoch",     # evaluation is done at the end of each epoch
    learning_rate=2e-5,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    num_train_epochs=3,
    weight_decay=0.01,
    save_strategy="epoch",
    load_best_model_at_end=True,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset['train'],
    eval_dataset=dataset['test']
)

# Start fine-tuning
trainer.train()
