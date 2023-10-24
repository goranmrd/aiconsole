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
    
from multiprocessing import Process, Manager

manager = Manager()
shared_dict = manager.dict()

def display_shared_objects(dictionary):
    # Keep in mind that the dictionary is shared between processes, the subprocess does not have logging set up
    for material in dictionary:
        print('Material:', material)

    # Assuming `Materials` class has a method `to_dict` which returns a dictionary representation of all materials.
    # materials = Materials()
    # shared_dict.update(materials.to_dict())

