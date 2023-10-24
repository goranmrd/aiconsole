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
    
import requests
import pkg_resources
from packaging import version
import logging

_log = logging.getLogger(__name__)


def is_update_needed():
    # Fetch all versions from the PyPI API
    try:
        response = requests.get('https://pypi.org/pypi/aiconsole/json')
    except requests.exceptions.ConnectionError:
        _log.error("Could not check if update is needed")
        return False
    all_versions = list(response.json()['releases'].keys())

    # Sort the versions
    all_versions.sort(key=version.parse, reverse=True)
    
    # Get the current version using pkg_resources
    try:
        current_version = version.parse(pkg_resources.get_distribution("aiconsole").version)
    except pkg_resources.DistributionNotFound:
        return False

    # If current version is pre-release, compare with all. Else, compare with non pre-releases
    if current_version.is_prerelease:
        latest_version = all_versions[0]  # Since we've sorted in descending order, the first version is the latest

    else:
        # Find the latest non-pre-release version
        latest_version = next((v for v in all_versions if not version.parse(v).is_prerelease), None)

    if latest_version is None:
        return False

    _log.debug(f"Current version: {current_version}")
    _log.debug(f"Latest version: {latest_version}")

    return version.parse(latest_version) > current_version