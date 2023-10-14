
from fastapi import APIRouter

from . import choose

router = APIRouter()

router.include_router(choose.router)