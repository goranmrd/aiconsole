from typing import cast
from aiconsole.core.assets.load_all_assets import load_all_assets
from aiconsole.core.assets.agents.agent import Agent
from aiconsole.core.assets.asset import AssetType
from aiconsole.core.assets.assets import Assets
from aiconsole.core.assets.materials.material import Material


async def get_all_agents() -> list[Agent]:
    lists = (await load_all_assets(AssetType.AGENT)).values()
    return cast(list[Agent], (list[0] for list in lists))


async def get_all_materials() -> list[Material]:
    lists = (await load_all_assets(AssetType.MATERIAL)).values()
    return cast(list[Material], (list[0] for list in lists))
