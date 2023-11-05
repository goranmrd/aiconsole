import json
import re
from pathlib import Path

def get_version_from_package_json():
    package_json_path = Path('..') / 'electron' / 'package.json'
    with package_json_path.open() as f:
        data = json.load(f)
    return data['version']

def update_version_in_pyproject_toml(version):
    pyproject_toml_path = Path('..') / 'backend' / 'pyproject.toml'
    pyproject_content = pyproject_toml_path.read_text()
    pyproject_content = re.sub(r'version = "\S+"', f'version = "{version}"', pyproject_content)
    pyproject_toml_path.write_text(pyproject_content)

def update_version_in_frontend_package_json(version):
    frontend_package_json_path = Path('..') / 'frontend' / 'package.json'
    frontend_package_content = frontend_package_json_path.read_text()
    frontend_package_content = re.sub(r'"version": "\S+"', f'"version": "{version}"', frontend_package_content)
    frontend_package_json_path.write_text(frontend_package_content)

def main():
    version = get_version_from_package_json()
    print(f"Current version: {version}")
    update_version_in_pyproject_toml(version)
    update_version_in_frontend_package_json(version)
    print("Version updated successfully.")

if __name__ == "__main__":
    main()