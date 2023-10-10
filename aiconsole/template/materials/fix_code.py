"""

## How to fix code

1. Search for the file containing the code you want to fix.
2. Read the file
3. Develop a concept of what you want to change
4. Change the code
5. See if the code is working
6. If not, repeat steps 2-5

"""

import logging
import os
import litellm

log = logging.getLogger(__name__)


def convert_language(file_name, desired_language):
    """
    How to convert files to another programing language

    1. If a directory is specified, list and convert all the files in the directory structure recursively.
    2. For each file run this code and attach the output at the begining of the file:

    import fix_code
    fix_code.convert_language(FILE_PATH, DESIRED_LANGUAGE)

    """
    file_contents = open(file_name).read()

    completion = litellm.completion(
        model="gpt-4",
        messages=[
            {"role": "system", "content": f"You are a master programmer, translate the following code into {desired_language}. Translate what you can, don't complain. This is just a starter so a human programmer can finish the job."},
            {"role": "user", "content": file_contents}
        ]
    )

    # Create .py file with the same name
    file_name = os.path.splitext(file_name)[0] + ".py"
    with open(file_name, "w") as f:
        f.write(completion.choices[0]["message"]["content"])
        f.write("\n")
        # Write existing code into multiline comment
        if desired_language == "python":
            f.write(f"""'''\n\n{file_contents}\n\n'''\n""")
        else:
            f.write(f"""/*\n\n{file_contents}\n\n*/\n""")

        log.info(f"Created {file_name}")


material = {
    "usage": "When you need to fix code or translate it to another language",
}
