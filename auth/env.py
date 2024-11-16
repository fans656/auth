import uuid
from pathlib import Path

import yaml
from fans.path import make_paths


paths = make_paths([
    'conf.yaml', {'conf'},
    'data.sqlite', {'database'},
])


class Env:

    def setup(self, workdir):
        self.paths = paths.with_root(workdir).create()

        self.conf = self.paths.conf.ensure_conf({
            'initial_admin_username': 'admin',
            'initial_admin_password': lambda: uuid.uuid4().hex,
        })


env = Env()
