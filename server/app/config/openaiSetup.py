import os
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get OpenAI API Key from .env
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Ensure the API key is set
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is missing. Please set it in the .env file.")

# Configure OpenAI API
openai.api_key = OPENAI_API_KEY

def generate_text(prompt: str, model="gpt-4", max_tokens=200):
    """
    Generate text using OpenAI's API.

    :param prompt: The input text prompt for the AI.
    :param model: The OpenAI model to use (default: GPT-4).
    :param max_tokens: The maximum number of tokens to generate.
    :return: The AI-generated response.
    """
    try:
        response = openai.ChatCompletion.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.7
        )
        return response['choices'][0]['message']['content']
    except Exception as e:
        return f"Error generating text: {str(e)}"
