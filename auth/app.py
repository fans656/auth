import os

from fastapi import FastAPI, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from auth import cons
from auth import errors
from auth.env import env


app = FastAPI()


@app.on_event('startup')
async def startup():
    env.setup(os.environ.get('workdir') or cons.root_dir / 'data')


@app.get('/')
async def index():
    return FileResponse(cons.root_dir / 'frontend/dist/index.html')


@app.get('/favicon.ico')
async def favicon():
    return FileResponse(cons.root_dir / 'frontend/dist/favicon.ico')


@app.get('/assets/{path:path}')
async def assets(path):
    return FileResponse(cons.root_dir / 'frontend/dist/assets' / path)


class LoginReq(BaseModel):

    username: str = Field(..., max_length=100)
    password: str = Field(..., max_length=100)


@app.post('/api/login')
async def api_login(req: LoginReq, response: Response):
    user = env.get_user(req.username)

    if not user or not user.verify_password(req.password):
        raise errors.WrongUsernameOrPassword()

    token = user.generate_access_token()
    response.set_cookie(
        key='token',
        value=token.raw,
        max_age=token.expire_seconds,
    )
    return {'token': token.raw}
