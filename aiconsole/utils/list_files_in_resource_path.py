from importlib import resources


def list_files_in_resource_path(path: str):
    """
    Recursivelly list all paths to files in path
    """

    for entry in resources.contents(path):
        if resources.is_resource(path, entry):
            with resources.path(path, entry) as source_path:
                yield source_path
        else:
            yield from list_files_in_resource_path(f"{path}.{entry}")


