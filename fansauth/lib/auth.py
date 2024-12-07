import time
import inspect
from typing import Annotated, Callable

import jwt
import requests
from fastapi import FastAPI, APIRouter, HTTPException, Response
from fastapi import Depends, Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


_globals = {'public_key': None}


class User:

    def __init__(self, data):
        self.data = data
        self.username = data['username']

    def is_admin(self) -> bool:
        return self.data['admin']


class CheckMiddleware(BaseHTTPMiddleware):

    def __init__(self, app, check_func):
        super().__init__(app)

        if inspect.iscoroutinefunction(check_func):
            self.check_func = check_func
        else:
            self.check_func = _wrap_as_async(check_func)

    async def dispatch(self, req, call_next):
        req.state.get_user = lambda: _get_user(req)
        try:
            await self.check_func(req)
            return await call_next(req)
        except HTTPException as exc:
            return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
        except Exception as exc:
            return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


def auth(
        app,
        provider: str = 'https://auth.fans656.me',
        check: Callable[[Request, User], bool] = None,
):
    if isinstance(app, FastAPI):
        app.post('/api/grant')(api_grant)

        n_retries = 10
        for i_retry in range(n_retries):
            try:
                res = requests.get(f'{provider}/public-key')
                if res.status_code != 200:
                    raise RuntimeError(f'failed to retrieve public key from auth provider')
                _globals['public_key'] = res.text
                break
            except Exception:
                if i_retry + 1 == n_retries:
                    raise
                else:
                    time.sleep(0.1)
    else:
        raise TypeError(f'unsupported app type {type(app)}')

    if check:
        app.add_middleware(CheckMiddleware, check_func=check)

    return app


def api_grant(req: dict, response: Response):
    auth_server = req['auth_server']

    url = f'{auth_server}/api/token'
    json = {
        'grant_type': 'authorization_code',
        'code': req['grant'],
    }
    res = requests.post(url, json=json)

    if res.status_code != 200:
        raise HTTPException(400, 'Failed to get token')

    token = res.json()['token']
    response.set_cookie(
        key='token',
        value=token,
        # TODO: set expire
        # max_age=token.expire_seconds,
    )
    return {'token': token}


def _get_user(req):
    token = req.cookies.get('token')
    try:
        data = jwt.decode(token, _globals['public_key'], algorithms=['RS256'])
        return User(data)
    except Exception:
        return None


def dep_User(req: Request):
    user = _get_user(req)
    if not user:
        raise HTTPException(401)
    return user


auth.User = Annotated[User, Depends(dep_User)]


def dep_Admin(user: auth.User):
    if not user.is_admin():
        raise HTTPException(403)
    return user


auth.Admin = Annotated[User, Depends(dep_Admin)]


def auth_check(check_func):
    pass


auth.check = auth_check


def _wrap_as_async(func):
    async def wrapped(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapped
