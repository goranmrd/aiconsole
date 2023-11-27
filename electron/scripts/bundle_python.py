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

import subprocess
import platform
from pathlib import Path
import requests
import tarfile
import os

python_dir = Path(".") / "python"


def check_installation():
    if python_dir.is_dir():
        print("Python already installed.")
    else:
        download_python()
    install_dependencies()
    print("Build process completed!")


def download_python():
    print("Detecting machine architecture...")
    arch_name = platform.machine()
    system_name = platform.system()

    file_name = None
    download_url = None

    if system_name == "Darwin":
        if arch_name == "x86_64":
            print("Detected Intel architecture for macOS.")
            variant = "x86_64-apple-darwin"
        elif arch_name == "arm64":
            print("Detected Apple M1 architecture.")
            variant = "aarch64-apple-darwin"
        else:
            print(f"Unknown architecture: {arch_name}")
            exit(1)

    elif system_name == "Linux":
        print("Detected Linux architecture.")
        variant = "x86_64-unknown-linux-gnu"

    elif system_name == "Windows":
        print("Detected Windows architecture.")
        variant = "x86_64-pc-windows-msvc-shared"

    else:
        print(f"Unknown operating system: {system_name}")
        exit(1)

    file_name = f"cpython-3.10.13+20231002-{variant}-install_only.tar.gz"
    download_url = f"https://github.com/indygreg/python-build-standalone/releases/download/20231002/{file_name}"

    print(f"Downloading standalone Python for {system_name} {arch_name}...")
    response = requests.get(download_url)
    with open(file_name, 'wb') as file:
        file.write(response.content)

    print("Extracting Python...")
    with tarfile.open(file_name) as tar:
        tar.extractall(path=".")

    os.remove(file_name)


def install_dependencies():
    if platform.system() == "Windows":
        python_path = python_dir / "python.exe"
        print(f"Installing aiconsole and dependencies  ({python_path} -m pip) ...")
        subprocess.run([python_path, "-m", "pip", "install", Path("..") / "backend"], check=True)
    else:
        pip_path = python_dir / "bin" / "pip"
        print(f"Installing aiconsole and dependencies  ({pip_path}) ...")
        subprocess.run([pip_path, "install", Path("..") / "backend"], check=True)


def main():
    check_installation()


if __name__ == "__main__":
    main()
