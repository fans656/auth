import json
import datetime

import jwt

from auth import utils


class User:

    def __init__(self, model, private_key: bytes):
        self.model = model
        self.private_key = private_key

        self.meta = json.loads(self.model.meta)
        self.extra = json.loads(self.model.extra)

    def verify_password(self, password: str) -> bool:
        got_pwd = utils.hashed_password(password, self.model.salt)
        exp_pwd = self.model.hashed_password
        return got_pwd == exp_pwd

    @property
    def access_token(self) -> str:
        token = self.generate_access_token()
        return token.raw

    def generate_access_token(self):
        return AccessToken(
            {
                'user': self.model.username,
            },
            private_key=self.private_key,
        )

    def is_admin(self) -> bool:
        return self.meta.get('admin') == True

    def __str__(self):
        return f'User(username={self.model.username})'


class AccessToken:

    def __init__(
            self,
            data,
            private_key: bytes,
            expire_days: int = 30,
    ):
        self.data = data
        self.expire_days = expire_days

        now = datetime.datetime.utcnow()
        self.data.update({
            'sub': str(int(now.timestamp())),
            'exp': int((now + datetime.timedelta(days=expire_days)).timestamp()),
        })

        self.raw = jwt.encode(data, private_key, algorithm='RS256')

    @property
    def expire_seconds(self) -> int:
        return self.expire_days * 24 * 3600
