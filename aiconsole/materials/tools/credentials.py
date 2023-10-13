import json
import os
from aiconsole import projects

def save_credential(module: str, credential: str, value: str):
    # Specify the path for the credential file
    file_path = os.path.join(projects.get_credentials_directory(), module + ".json")
    
    # Ensure the directory for the file exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    # Load the existing JSON object or create an empty one if the file doesn't exist
    try:
        with open(file_path, "r") as f:
            credentials = json.load(f)
    except FileNotFoundError:
        credentials = {}
    
    # Update the credential
    credentials[credential] = value
    
    # Save the updated credentials back to the JSON file
    with open(file_path, "w") as f:
        json.dump(credentials, f, indent=4)  # Use an indent of 4 for pretty printing

def load_credential(module: str, credential: str) -> str:
    
    # Try env first
    env_name = (module + "_" + credential).upper()
    if os.environ.get(env_name):
        return os.environ.get(env_name) or ""
    
    # Try file
    try: 
        with open(os.path.join(projects.get_credentials_directory(), module + ".json"), "r") as f:
            value = str(json.loads(f.read())[credential])
            if value:
                return value
    except FileNotFoundError:
        pass
    except KeyError:
        pass

    raise Exception(f'''
Could not find credential {credential} for module {module}.

Ask the user to give you {credential} and then save it like this:

from aiconsole.credentials import save_credential
save_credential("{module}", "{credential}", your_value)
    '''.strip())