from pathlib import Path


def list_files_in_resource_path(path: str):
    """
    Recursively list all paths to files in path
    """
    base_path = Path(path.replace('.', '/'))

    if not base_path.exists():
        return

    for entry in base_path.iterdir():
        if entry.is_file():
            yield entry
        else:
            yield from list_files_in_resource_path(str(entry).replace('/', '.'))
