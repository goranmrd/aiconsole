from aiconsole import projects


import random


def create_agents_str() -> str:
    """
    Randomization of agents is done because LLMs have a tendency to overfit to the first few examples.
    """
    available_agents = projects.get_project_agents().all_agents()

    new_line = "\n"

    random_agents = new_line.join(
        [
            f"* {c.id} - {c.usage}"
            for c in random.sample(available_agents, len(available_agents))
        ]
    )

    return random_agents