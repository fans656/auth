import jwt
import pytest
from starlette.testclient import TestClient

from fans.path import Path

from auth.env import env
from auth.app import app


@pytest.fixture
def client(tmp_path):
    conf_path = Path(tmp_path) / 'conf.yaml'
    conf_path.ensure_conf({
        'initial_users': [
            {'username': 'foo', 'password': 'foo'},
        ],
    })

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

        # verify cookie token
        cookie_token = None
        max_age = None
        set_cookie_header = res.headers['set-cookie']
        parts = set_cookie_header.split('; ')
        for part in parts:
            if part.startswith('Max-Age='):
                max_age = part.split('=')[1]
            if part.startswith('token='):
                cookie_token = part.split('=')[1]
        assert max_age
        data = jwt.decode(cookie_token, algorithms=['RS256'], options={"verify_signature": False})
        assert data['user'] == 'admin'

        # verify body token
        token = res.json()['token']
        data = jwt.decode(token, algorithms=['RS256'], options={"verify_signature": False})
        assert data['user'] == 'admin'

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


class Test_users:

    def test_401(self, client):
        assert client.get('/api/users').status_code == 401

    def test_403(self, client):
        client.cookies.set('token', env.get_user('foo').access_token)
        assert client.get('/api/users').status_code == 403

    def test_200(self, client):
        client.cookies.set('token', env.get_user('admin').access_token)
        assert client.get('/api/users').status_code == 200
