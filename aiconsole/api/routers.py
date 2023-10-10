from fastapi import APIRouter

from aiconsole.api.endpoints import analyse, chats, commands_history, execute, profile, image, agents, run_code, ws


app_router = APIRouter()

app_router.include_router(image.router, tags=["image"])
app_router.include_router(analyse.router, tags=["analyse"])
app_router.include_router(execute.router, tags=["execute"])
app_router.include_router(run_code.router, tags=["run"])
app_router.include_router(profile.router, tags=["profile"])
app_router.include_router(chats.router, prefix="/chats", tags=["chats"])
app_router.include_router(commands_history.router, tags=["commands_history"])
app_router.include_router(agents.router, tags=["agents"])
app_router.include_router(ws.router, tags=["ws"])
