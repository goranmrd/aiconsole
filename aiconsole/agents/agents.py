import importlib.util
import logging
import os
from pathlib import Path
from typing import Dict
from pydantic import ValidationError

import watchdog.events
import watchdog.observers
from aiconsole.agents.types import Agent

from aiconsole.execution_modes.interpreter import execution_mode_interpreter
from aiconsole.execution_modes.normal import execution_mode_normal
from aiconsole.utils.BatchingWatchDogHandler import BatchingWatchDogHandler
from aiconsole.utils.list_files_in_file_system import list_files_in_file_system
from aiconsole.utils.list_files_in_resource_path import list_files_in_resource_path
from aiconsole.websockets.outgoing_messages import NotificationWSMessage

_log = logging.getLogger(__name__)


async def _notify_and_log(message: str):
    _log.info(message)
    await NotificationWSMessage(title="Agent not loaded", message=message).send_to_all()


class Agents:
    """
    Agents class is for managing the .md and .py agent files.
    """

    agents: Dict[str, Agent]

    def __init__(self, core_resource, user_agents_directory):
        self.core_resource = core_resource
        self.user_directory = user_agents_directory
        self.agents = {}

        self.observer = watchdog.observers.Observer()
        os.makedirs(self.user_directory, exist_ok=True)
        self.observer.schedule(
            BatchingWatchDogHandler(self.reload), self.user_directory, recursive=True
        )
        self.observer.start()

    def stop(self):
        self.observer.stop()

    def all_agents(self):
        """
        Return all loaded materials.
        """
        return list(self.agents.values())

    async def reload(self):
        _log.info("Reloading agents ...")

        execution_modes = {
            "interpreter": execution_mode_interpreter,
            "normal": execution_mode_normal,
        }

        self.agents = {}

        paths = [
            path
            for paths_yielding_function in [
                list_files_in_resource_path(self.core_resource),
                list_files_in_file_system(self.user_directory),
            ]
            for path in paths_yielding_function
        ]

        for path in paths:
            filename = os.path.basename(path)
            if not filename.endswith(".py") or filename == '__init__.py':
                continue
            # Import the file and execute material function to get the material
            module_name = os.path.splitext(filename)[0]
            spec = importlib.util.spec_from_file_location(module_name, path)
            if not spec or spec.loader is None:
                await _notify_and_log(f"Skipping invalid agent in file {filename}")
                continue

            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)

            # check if is dict
            if not isinstance(module.agent, dict):
                await _notify_and_log(f"Skipping invalid agent in file {filename}")
                continue

            agent = module.agent.copy()
            id = filename[:-3]
            if id in self.agents:
                await _notify_and_log(
                    f"Skipping duplicate agent {id} in file {filename}"
                )
                continue

            execution_mode_name = agent.pop("execution_mode", "")

            try:
                self.agents[id] = Agent(
                    id=id,
                    execution_mode=execution_modes[execution_mode_name],
                    **agent,
                )
            except ValidationError as e:
                await _notify_and_log(
                    f"Skipping invalid agent in file {filename}: {e}"
                )
                continue

        await NotificationWSMessage(
            title="Agents reloaded", message=f"Reloaded {len(self.agents)} agents"
        ).send_to_all()
        _log.info(f"Reloaded {len(self.agents)} agents")
