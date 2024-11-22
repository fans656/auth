import os
import uuid
from pathlib import Path
from typing import Optional

import yaml
from fans.path import make_paths

from auth import db
from auth.user import User


paths = make_paths([
    'conf.yaml', {'conf'},
    'data.sqlite', {'database'},
    'sign-key', {'sign_key_private'},
    'sign-key.pub', {'sign_key_public'},
])


class Env:

    def __init__(self):
        self.setup_done = False

    def setup(self, workdir, force=False):
        if not force and self.setup_done:
            return

        self.paths = paths.with_root(workdir).create()

        self.conf = self.paths.conf.ensure_conf({
            'initial_admin_username': 'admin',
            'initial_admin_password': lambda: uuid.uuid4().hex,
        })
        self.database = db.init_database(self.paths.database)

        self.ensure_admin_user()
        self.ensure_users()
        self.ensure_keys()

        self.setup_done = True

    def ensure_keys(self):
        if not self.paths.sign_key_private.exists():
            os.system(f'ssh-keygen -t rsa -b 2048 -N "" -m PEM '
                      f'-f {self.paths.sign_key_private} > /dev/null')
        with self.paths.sign_key_private.open() as f:
            self.private_key = f.read()
        with self.paths.sign_key_public.open() as f:
            self.public_key = f.read()

    def ensure_admin_user(self):
        db.create_user(
            username=self.conf['initial_admin_username'],
            password=self.conf['initial_admin_password'],
            meta={'admin': True},
        )

    def ensure_users(self):
        for user in self.conf.get('initial_users', []):
            db.create_user(
                username=user['username'],
                password=user['password'],
                meta=user.get('meta', {}),
                extra=user.get('extra', {}),
            )

    def get_user(self, username: str) -> Optional[User]:
        model = db.get_user(username)
        if not model:
            return None
        return User(model, private_key=self.private_key)

    def get_users(self):
        return db.get_users()

    def create_user(self, *args, **kwargs):
        return db.create_user(*args, **kwargs)

    def edit_user(self, username: str, meta: dict, extra: dict):
        model = db.get_user(username)
        db.update_user_attr(username, meta, extra)

    def delete_user(self, username: str):
        return db.delete_user(username)

    def change_password(self, username: str, new_password: str):
        return db.change_password(username, new_password)


env = Env()
