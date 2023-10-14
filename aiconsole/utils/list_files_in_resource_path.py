from aiconsole.utils.resource_to_path import resource_to_path


def list_files_in_resource_path(resource: str):
    """
    Recursively list all paths to files in path
    """

    abs_path = resource_to_path(resource)


    if not abs_path.exists():
        return

    for entry in abs_path.iterdir():
        if entry.is_file():
            yield entry
        else:
            yield from list_files_in_resource_path(str(entry).replace('/', '.'))
