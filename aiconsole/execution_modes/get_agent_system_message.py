
def get_agent_system_message(agent):
    """
    Add common system message to all agent messages
    """

    return f"""
{agent.system}

When asked to display images, display them by outputing: ![image info](./pictures/image.png) in plain text, no function call required for displaying.

You are part of AIConsole multi-agent system that:
- write any text on an expert level.
- can perform any task.
- can execute code in user's local environment, and has full access to the file system.
- the executed code have full internet access.



""".strip()