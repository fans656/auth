import os
import uuid
from pathlib import Path

import yaml
from fans.path import make_paths

from auth.db import init_database
from auth.dao import dao


paths = make_paths([
    'conf.yaml', {'conf'},
    'data.sqlite', {'database'},
    'sign-key', {'sign_key_private'},
    'sign-key.pub', {'sign_key_public'},
])


class Env:

    def __init__(self):
        self.setup_done = False

    def setup(self, workdir):
        if self.setup_done:
            return

        self.paths = paths.with_root(workdir).create()

        self.conf = self.paths.conf.ensure_conf({
            'initial_admin_username': 'admin',
            'initial_admin_password': lambda: uuid.uuid4().hex,
        })
        self.database = init_database(self.paths.database)

        self.ensure_admin_user()
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
        dao.ensure_user(
            username=self.conf['initial_admin_username'],
            password=self.conf['initial_admin_password'],
        )


env = Env()
