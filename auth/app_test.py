import jwt
import pytest
from starlette.testclient import TestClient

from fans.path import Path

from auth.env import env
from auth.app import app


@pytest.fixture
def client(tmp_path):
    print('tmp_path', tmp_path)
    conf_path = Path(tmp_path) / 'conf.yaml'
    conf_path.ensure_conf({
        'initial_users': [
            {'username': 'guest', 'password': 'guest'},
        ],
    })

    env.setup(tmp_path, force=True)
    with TestClient(app) as client:
        yield client


@pytest.fixture
def guest_client(client):
    client.cookies.set('token', env.get_user('guest').access_token)
    yield client


@pytest.fixture
def admin_client(client):
    client.cookies.set('token', env.get_user('admin').access_token)
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


class AdminOnly:

    method = 'get'
    endpoint = None

    def test_401(self, client):
        assert getattr(client, self.method)(self.endpoint).status_code == 401

    def test_403(self, guest_client):
        assert getattr(guest_client, self.method)(self.endpoint).status_code == 403


class Test_users(AdminOnly):

    endpoint = '/api/users'

    def test_200(self, admin_client):
        assert admin_client.get('/api/users').status_code == 200


class Test_create_user(AdminOnly):

    method = 'post'
    endpoint = '/api/create-user'

    def test_200(self, admin_client):
        assert admin_client.post('/api/create-user', json={
            'username': 'foo',
            'password': 'foo',
        }).status_code == 200

        data = admin_client.get('/api/user', params={'username': 'foo'}).json()
        assert data['username'] == 'foo'

    def test_409(self, admin_client):
        assert admin_client.post('/api/create-user', json={
            'username': 'admin',
            'password': 'admin',
        }).status_code == 409


class Test_delete_user(AdminOnly):

    method = 'post'
    endpoint = '/api/delete-user'

    def test_cannot_delete_self(self, admin_client):
        assert admin_client.post('/api/delete-user', json={
            'username': 'admin',
        }).status_code == 400

    def test_200(self, admin_client):
        assert admin_client.post('/api/create-user', json={
            'username': 'foo',
            'password': 'foo',
        }).status_code == 200

        assert admin_client.post('/api/delete-user', json={
            'username': 'foo',
        }).status_code == 200

        assert admin_client.get('/api/user', params={'username': 'foo'}).status_code == 404


class Test_edit_user(AdminOnly):

    method = 'post'
    endpoint = '/api/edit-user'

    def test_cannot_remove_admin_role_of_self(self, admin_client):
        assert admin_client.post('/api/edit-user', json={
            'username': 'admin',
            'meta': {},
            'extra': {},
        }).status_code == 400

    def test_edit_self_meta(self, admin_client):
        assert admin_client.post('/api/edit-user', json={
            'username': 'admin',
            'meta': {'admin': True, 'foo': 3},
            'extra': {},
        }).status_code == 200

        data = admin_client.get('/api/user', params={'username': 'admin'}).json()
        assert data['meta']['foo'] == 3

    def test_edit_other_user_meta(self, admin_client):
        assert admin_client.post('/api/edit-user', json={
            'username': 'guest',
            'meta': {'foo': 3},
            'extra': {},
        }).status_code == 200

        data = admin_client.get('/api/user', params={'username': 'guest'}).json()
        assert data['meta']['foo'] == 3

    def test_edit_self_extra(self, admin_client):
        assert admin_client.post('/api/edit-user', json={
            'username': 'admin',
            'meta': {'admin': True},
            'extra': {'foo': 3},
        }).status_code == 200

        data = admin_client.get('/api/user', params={'username': 'admin'}).json()
        assert data['extra']['foo'] == 3

    def test_edit_other_user_extra(self, admin_client):
        assert admin_client.post('/api/edit-user', json={
            'username': 'guest',
            'meta': {},
            'extra': {'foo': 3},
        }).status_code == 200

        data = admin_client.get('/api/user', params={'username': 'guest'}).json()
        assert data['extra']['foo'] == 3
