import importlib.util
import logging

_log = logging.getLogger(__name__)


def documentation_from_code(source: str):
    """
    Creates content of a material from a python material file.
    """

    def create_content(context):
        import inspect
        spec = importlib.util.spec_from_file_location(
            module_name, path)

        if not spec or spec.loader is None:
            raise Exception(f'Could not load module {module_name} from {path}')

        python_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(python_module)

        function_list = []
        for name, obj in inspect.getmembers(python_module):
            
            # take only locally defined exports, no imports
            if name.startswith('_'):
                continue

            if inspect.isfunction(obj):
                # Extract function signature
                async_prefix = "async " if inspect.iscoroutinefunction(obj) else ""
                signature = inspect.signature(obj)
                function_declaration = f"{async_prefix}def {name}{signature}"
                doc = inspect.getdoc(obj) or ''
                function_list.append(f'''
## {function_declaration}

{doc}
'''.strip() + '\n')

        
        # get main docstring
        docstring = inspect.getdoc(python_module)

        newline = '\n'
        final_doc = f'''
# Python Module '{module_name}'

{python_module.material["usage"]}
{docstring + newline + newline if docstring else ''}
{(newline + newline).join(function_list)}
'''.strip()
            
        return final_doc

    return create_content
