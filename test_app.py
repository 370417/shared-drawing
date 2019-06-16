import pytest

from app import create_app
from db import db, init_db, User

def generate_app():
    app = create_app('test.cfg')
    db.drop_all(app=app)
    db.create_all(app=app)
    return app

@pytest.fixture
def client():
    app = generate_app()
    with app.app_context():
        yield app.test_client()

@pytest.fixture
def database():
    app = generate_app()
    with app.app_context():
        yield db

def test_client_setup(client):
    assert True

def test_db_initially_empty(database):
    assert len(User.query.all()) == 0

def test_user_db_roundtrip(database):
    user = User()
    uuid = user.id
    database.session.add(user)
    database.session.commit()
    assert User.query.all()[0].id == uuid
