from aiconsole.analysis.AnalysisResponse import AnalysisResponse
from aiconsole.analysis.variant_quality_single_shot import variant_quality_single_shot
from aiconsole.chat.types import Chat

async def director_analyse(chat: Chat) -> AnalysisResponse:
    return await variant_quality_single_shot(chat)