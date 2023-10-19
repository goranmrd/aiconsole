
import json
import os
from typing import List, Dict
from aiconsole import projects

class MissingCredentialException(Exception):
    pass

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

def load_credentials(module: str, credentials: List[str]) -> Dict[str, str]:
    result = {}

    for credential in credentials:
        # Try env first
        env_name = (module + "_" + credential).upper()
        if os.environ.get(env_name):
            result[credential] = os.environ.get(env_name) or ""
            continue
        
        # Try file
        try: 
            with open(os.path.join(projects.get_credentials_directory(), module + ".json"), "r") as f:
                value = str(json.loads(f.read())[credential])
                if value:
                    result[credential] = value
                    continue
        except FileNotFoundError:
            pass
        except KeyError:
            pass

    missing_credentials = [credential for credential in credentials if credential not in result]

    if missing_credentials:
        raise MissingCredentialException(f'''
This module ({module}) requires following credentials: {','.join(credentials)}.

Could not find credentials: {','.join(missing_credentials)}.

The user should provide those credentials, explain to them how to do it, and what they are.
Don't use 'getpass' or anything that reads from the console, ask them using text,
When they provide you with credentials, save the credentials for the user, using the following code:

from aiconsole.dev.credentials import save_credential
save_credential("{module}", "{missing_credentials[0]}", your_value)
    ...
        '''.strip())
    
    return result