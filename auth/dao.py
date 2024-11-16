import json
import uuid

from auth import utils
from auth.db import User


class DAO:

    def ensure_user(self, username: str, password: str):
        if not User.get_or_none(User.username == username):
            salt = uuid.uuid4().hex
            User.create(**{
                'username': username,
                'hashed_password': utils.hashed_password(password, salt),
                'salt': salt,
                'meta': json.dumps({}),
            })

    def get_user(self, username: str):
        return User.get_or_none(User.username == username)


dao = DAO()
