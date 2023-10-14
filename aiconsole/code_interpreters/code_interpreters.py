from aiconsole.code_interpreters.language_map import language_map


code_interpreters = {}

def get_code_interpreter(language):
    if language not in code_interpreters:
        # Case in-sensitive
        language = language.lower()

        try:
            code_interpreters[language] = language_map[language]()
        except KeyError:
            raise ValueError(f"Unknown or unsupported language: {language}")
    
    return code_interpreters[language]


def reset_code_interpreters():
    global code_interpreters

    for code_interpreter in code_interpreters.values():
        code_interpreter.terminate()

    code_interpreters = {}
