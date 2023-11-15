from typing import cast
from aiconsole.core.assets.load_all_assets import load_all_assets
from aiconsole.core.assets.agents.agent import Agent
from aiconsole.core.assets.asset import AssetType
from aiconsole.core.assets.assets import Assets


async def get_all_agents() -> list[Agent]:
    return cast(list[Agent], (await load_all_assets(AssetType.AGENT)).values())
