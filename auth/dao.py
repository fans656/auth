import json
import uuid

from auth import utils
from auth.db import User


class DAO:

    def ensure_user(self, username: str, password: str, meta: dict = {}, extra: dict = {}):
        if not User.get_or_none(User.username == username):
            salt = uuid.uuid4().hex
            User.create(**{
                'username': username,
                'hashed_password': utils.hashed_password(password, salt),
                'salt': salt,
                'meta': json.dumps(meta),
                'extra': json.dumps(extra),
            })

    def get_user(self, username: str):
        return User.get_or_none(User.username == username)

    def get_users(self):
        return User.select()


dao = DAO()
