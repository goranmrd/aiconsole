# The AIConsole Project
#
# Copyright 2023 10Clouds
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
    

import json
import os
from typing import Dict, List

from aiconsole.core.project import project
from aiconsole.core.project.paths import get_credentials_directory


class MissingCredentialException(Exception):
    pass

def save_credential(module: str, credential: str, value: str):
    # Specify the path for the credential file
    file_path = get_credentials_directory() / (module + ".json")
    
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
            with open(get_credentials_directory() / (module + ".json"), "r") as f:
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