from typing import Annotated

import jwt
from fastapi import Depends, Request, HTTPException

from auth import errors
from auth.env import env
from auth.user import User as _User


def get_current_user(req: Request):
    token = req.cookies.get('token')

    if token:
        try:
            data = jwt.decode(token, env.public_key, algorithms=['RS256'])
            return env.get_user(data['user'])
        except Exception:
            return None
    else:
        return None


User = Annotated[_User, Depends(get_current_user)]


def is_admin_user(user: User):
    if not user:
        raise HTTPException(401, 'Login required')
    if not (user and user.is_admin()):
        raise HTTPException(403, 'Admin required')
    return user


Admin = Annotated[_User, Depends(is_admin_user)]


def paginated(offset: int = 0, limit: int = 0):
    def func(query):
        if offset:
            query = query.offset(offset)
        if limit:
            query = query.limit(limit)
        return query
    return func


Paginated = Annotated[callable, Depends(paginated)]
