from fastapi import APIRouter

from aiconsole.api.endpoints import analyse, chats, commands_history, execute, profile, image, agents, run_code, ws, materials, projects


app_router = APIRouter()

app_router.include_router(image.router)
app_router.include_router(analyse.router)
app_router.include_router(execute.router)
app_router.include_router(run_code.router)
app_router.include_router(profile.router)
app_router.include_router(chats.router, prefix="/chats")
app_router.include_router(materials.router, prefix="/api/materials")
app_router.include_router(projects.router, prefix="/api/projects")
app_router.include_router(commands_history.router)
app_router.include_router(agents.router)
app_router.include_router(ws.router)
