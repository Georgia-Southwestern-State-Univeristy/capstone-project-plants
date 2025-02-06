import openai

def generate_response(prompt: str, model="gpt-4", max_tokens=100):
    try:
        response = openai.ChatCompletion.create(
            model=model,
            messages=[{"role": "system", "content": "You are an AI plant care assistant."},
                      {"role": "user", "content": prompt}],
            max_tokens=max_tokens
        )
        return response["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Error: {str(e)}"