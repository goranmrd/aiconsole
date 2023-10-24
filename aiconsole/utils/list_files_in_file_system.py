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
    
import os


def list_files_in_file_system(path: str):
    """
    Recursivelly list all paths to files in path
    """

    for entry in os.listdir(path):
        if os.path.isfile(os.path.join(path, entry)):
            yield os.path.join(path, entry)
        else:
            yield from list_files_in_file_system(os.path.join(path, entry))