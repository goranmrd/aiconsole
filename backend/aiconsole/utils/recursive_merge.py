from typing import Dict, Any


def recursive_merge(dict1: Dict[str, Any], dict2: Dict[str, Any]) -> Dict[str, Any]:
    """Recursively merge dictionaries."""
    for k, v in dict2.items():
        if k in dict1:
            if isinstance(dict1[k], dict) and isinstance(v, dict):
                recursive_merge(dict1[k], v)
            elif isinstance(dict1[k], list) and isinstance(v, list):
                dict1[k].extend(v)
                dict1[k] = list(set(dict1[k]))
            else:
                dict1[k] = v
        else:
            dict1[k] = v
    return dict1
