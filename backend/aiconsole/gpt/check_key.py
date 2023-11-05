from aiconsole.gpt.consts import MODEL_DATA
import litellm

# Verify the OpenAI key has access to the required models
def check_key(key: str) -> bool:
    models = MODEL_DATA.keys()
    for model in models:
        if not litellm.check_valid_key(model=model, api_key=key):
            return False

    return True