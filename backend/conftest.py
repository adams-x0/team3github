import pytest # type: ignore
from app import app as flask_app  # app.py is in the same directory

@pytest.fixture
def app():
    flask_app.config['TESTING'] = True
    return flask_app

