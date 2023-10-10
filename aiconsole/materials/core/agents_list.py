from aiconsole.agents.agents import agents

newline = "\n"
material = {
    "usage": "Contains info about all the agents in AIConsole, useful when you want to know what agents are available and what they can do.",
    "content": lambda context: f'''
# List of Agents

Available agents: {newline.join(f'{f"* {agent.id} - {agent.usage}"}' for agent in agents.all_agents())}
'''
}
