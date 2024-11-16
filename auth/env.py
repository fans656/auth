import uuid
from pathlib import Path

import yaml
from fans.path import make_paths

from auth.db import init_database
from auth.dao import dao


paths = make_paths([
    'conf.yaml', {'conf'},
    'data.sqlite', {'database'},
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

        self.setup_done = True

    def ensure_admin_user(self):
        dao.ensure_user(
            username=self.conf['initial_admin_username'],
            password=self.conf['initial_admin_password'],
        )


env = Env()
