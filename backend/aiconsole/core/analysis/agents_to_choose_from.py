from aiconsole.core.assets.agents.agent import Agent
from aiconsole.core.assets.asset import AssetStatus
from aiconsole.core.project import project


from typing import cast


def agents_to_choose_from() -> list[Agent]:
    # Forced agents if available or enabled agents otherwise
    forced_agents = project.get_project_agents().assets_with_status(AssetStatus.FORCED)
    agents_to_choose_from = (
        forced_agents if forced_agents else project.get_project_agents().assets_with_status(AssetStatus.ENABLED)
    )
    agents_to_choose_from = cast(list[Agent], agents_to_choose_from)
    return agents_to_choose_from
