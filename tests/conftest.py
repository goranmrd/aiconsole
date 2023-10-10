import pytest
from fastapi.testclient import TestClient

from aiconsole.app import app


@pytest.fixture()
def app():
    return app()


@pytest.fixture()
def client(app):
    return TestClient(app)
