import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import validator, Field

from aiconsole.gpt.consts import GPTMode
import litellm

AIC_DIRECTORY = os.path.join(os.getcwd(), ".aic")
MATERIALS_DIRECTORY = os.path.join(os.getcwd(), "materials")
MATERIALS_CORE_RESOURCE = "aiconsole.materials.core"
AGENTS_DIRECTORY = os.path.join(os.getcwd(), "agents")
AGENTS_CORE_RESOURCE = "aiconsole.agents.core"
CREDENTIALS_DIRECTORY = os.path.join(AIC_DIRECTORY, "credentials")
DEFAULT_MODE = GPTMode.FAST
FUNCTION_CALL_OUTPUT_LIMIT: int = 2000


# FIXME: Move it to a more appropriate place
litellm.set_verbose = False
MAX_BUDGET = None

if MAX_BUDGET:
    litellm.max_budget = MAX_BUDGET



class Settings(BaseSettings):
    OPENAI_API_KEY: str
    ORIGINS: list[str] = ["http://localhost:3000"]

    LOG_FORMAT: str = "{asctime} {name} [{levelname}] {message}"
    LOG_STYLE: str = "{"
    LOG_LEVEL: str = Field("INFO", env=["LOG_LEVEL", "LOGLEVEL"])
    LOG_HANDLERS: list[str] = ["console"]

    HISTORY_LIMIT: int = 1000
    HISTORY_DIRECTORY: str = os.path.join(AIC_DIRECTORY, "history")
    COMMANDS_HISTORY_JSON: str = "command_history.json"

    @validator("LOG_LEVEL", pre=True)
    def uppercase_log_level(cls, v: str) -> str:
        return v.upper()

    class Config(SettingsConfigDict):
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()


log_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "console": {
            "()": "logging.Formatter",
            "fmt": settings.LOG_FORMAT,
            "style": settings.LOG_STYLE,
        }
    },
    "handlers": {
        "console": {
            "formatter": "console",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
        "sinkhole": {"class": "logging.NullHandler"},
    },
    "loggers": {
        "aiconsole": {
            "handlers": settings.LOG_HANDLERS,
            "level": settings.LOG_LEVEL,
            "propagate": False,
        },
        "uvicorn": {
            "handlers": settings.LOG_HANDLERS,
            "level": "INFO",
        },
    },
}
