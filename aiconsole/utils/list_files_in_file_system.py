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