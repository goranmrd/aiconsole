
from fastapi import APIRouter

from . import material, index, preview

router = APIRouter()

router.include_router(preview.router)
router.include_router(material.router)
router.include_router(index.router)