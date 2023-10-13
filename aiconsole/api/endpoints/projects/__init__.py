
from fastapi import APIRouter

from . import choose, current

router = APIRouter()

router.include_router(choose.router)
router.include_router(current.router)