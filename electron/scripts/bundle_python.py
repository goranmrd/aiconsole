import subprocess
import platform
from pathlib import Path
import requests
import tarfile
import os

python_dir = Path("./python")

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

    if arch_name == "x86_64":
        print("Detected Intel architecture.")
        file_name = "cpython-3.10.13+20231002-x86_64-apple-darwin-install_only.tar.gz"
        download_url = "https://github.com/indygreg/python-build-standalone/releases/download/20231002/" + file_name

    elif arch_name == "arm64":
        print("Detected Apple M1 architecture.")
        file_name = "cpython-3.10.13+20231002-aarch64-apple-darwin-install_only.tar.gz"
        download_url = "https://github.com/indygreg/python-build-standalone/releases/download/20231002/" + file_name

    else:
        print(f"Unknown architecture: {arch_name}")
        exit(1)

    print(f"Downloading standalone Python for {arch_name}...")
    response = requests.get(download_url)
    with open(file_name, 'wb') as file:
        file.write(response.content)

    print("Extracting Python...")
    with tarfile.open(file_name) as tar:
        tar.extractall(path=".")
    os.remove(file_name)

def install_dependencies():
    print("Installing aiconsole and dependencies...")
    subprocess.run([str(python_dir.joinpath("bin", "pip")), "install", "../backend"], check=True)

def main():
    check_installation()

if __name__ == "__main__":
    main()
