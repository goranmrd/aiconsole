import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import validator, Field

from aiconsole.gpt.consts import GPTMode
import litellm


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

    AIC_DIRECTORY: str = os.path.join(os.getcwd(), ".aic")

    HISTORY_LIMIT: int = 1000
    HISTORY_DIRECTORY: str = ""
    COMMANDS_HISTORY_JSON: str = "command_history.json"

    MATERIALS_DIRECTORY: str = os.path.join(os.getcwd(), "materials")
    MATERIALS_CORE_RESOURCE: str = "aiconsole.materials.core"
    AGENTS_DIRECTORY: str = os.path.join(os.getcwd(), "agents")
    AGENTS_CORE_RESOURCE: str = "aiconsole.agents.core"
    CREDENTIALS_DIRECTORY: str = ""

    DEFAULT_MODE: str = GPTMode.FAST.value
    FUNCTION_CALL_OUTPUT_LIMIT: int = 2000


    DIRECTOR_MIN_TOKENS: int = 250
    DIRECTOR_PREFERRED_TOKENS: int = 1000


    MIDJOURNEY_TIMEOUT: int = 100

    @validator("LOG_LEVEL", pre=True)
    def uppercase_log_level(cls, v: str) -> str:
        return v.upper()

    @validator("HISTORY_DIRECTORY", always=True)
    def set_history_directory(cls, value: str, values) -> str:
        return os.path.join(values["AIC_DIRECTORY"], "history")

    @validator("CREDENTIALS_DIRECTORY", always=True)
    def set_credentials_directory(cls, value: str, values) -> str:
        return os.path.join(values["AIC_DIRECTORY"], "credentials")

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
