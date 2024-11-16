import json
import uuid
import hashlib

from auth import errors
from auth.db import User as DbUser


class DAO:

    def ensure_user(self, username: str, password: str):
        if not DbUser.get_or_none(DbUser.username == username):
            salt = uuid.uuid4().hex
            DbUser.create(**{
                'username': username,
                'hashed_password': hashed_password(password, salt),
                'salt': salt,
                'meta': json.dumps({}),
            })

    def get_user(self, username: str):
        model = DbUser.get_or_none(DbUser.username == username)
        return User(model) if model else None


class User:

    def __init__(self, model):
        self.model = model

    def verify_password(self, password: str) -> bool:
        got_pwd = hashed_password(password, self.model.salt)
        exp_pwd = self.model.hashed_password
        return got_pwd == exp_pwd


def hashed_password(password, salt):
    return hashlib.md5((password + salt).encode()).hexdigest()


dao = DAO()
