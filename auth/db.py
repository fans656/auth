import time
import json
import uuid
from pathlib import Path

import peewee

from auth import utils


class User(peewee.Model):

    username = peewee.TextField(primary_key=True)
    hashed_password = peewee.TextField()
    salt = peewee.TextField()
    meta = peewee.TextField()
    extra = peewee.TextField()
    ctime = peewee.IntegerField()


tables = [
    User,
]


def create_user(username: str, password: str, meta: dict = None, extra: dict = None):
    if not User.get_or_none(User.username == username):
        salt = uuid.uuid4().hex
        User.create(**{
            'username': username,
            'hashed_password': utils.hashed_password(password, salt),
            'salt': salt,
            'meta': json.dumps(meta or {}),
            'extra': json.dumps(extra or {}),
            'ctime': int(time.time()),
        })
        return User.get_or_none(User.username == username)


def delete_user(username: str):
    User.delete().where(User.username == username).execute()


def update_user_attr(username: str, meta: dict, extra: dict):
    assert isinstance(meta, dict)
    assert isinstance(extra, dict)
    User.update(
        meta=json.dumps(meta),
        extra=json.dumps(extra),
    ).where(User.username == username).execute()


def get_user(username: str):
    return User.get_or_none(User.username == username)


def get_users():
    return User.select().order_by(User.ctime)


def init_database(database_path: Path):
    database = peewee.SqliteDatabase(database_path)
    database.bind(tables)
    database.create_tables(tables)
    return database
