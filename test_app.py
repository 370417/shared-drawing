import pytest

import os
from app import create_app
from db import init_db

@pytest.fixture
def client():
    app = create_app('test.cfg')
    client = app.test_client()

    ctx = app.app_context()
    ctx.push()

    yield client

    ctx.pop()

def test_setup(client):
    assert True
