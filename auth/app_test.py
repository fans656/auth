import pytest
from starlette.testclient import TestClient

from auth.env import env
from auth.app import app


@pytest.fixture
def client(tmp_path):
    env.setup(tmp_path)
    with TestClient(app) as client:
        yield client


class TestLogin:

    def test_admin(self, client):
        res = client.post('/api/login', json={
            'username': 'admin',
            'password': env.conf['initial_admin_password'],
        })
        assert res.status_code == 200

    def test_admin_wrong_username(self, client):
        res = client.post('/api/login', json={
            'username': '<wrong_username>',
            'password': env.conf['initial_admin_password'],
        })
        assert res.status_code == 400

    def test_admin_wrong_password(self, client):
        res = client.post('/api/login', json={
            'username': 'admin',
            'password': '<wrong_password>',
        })
        assert res.status_code == 400
