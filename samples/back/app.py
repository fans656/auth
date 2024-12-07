from fans.ports import ports
from fansauth import auth
from fastapi import FastAPI, HTTPException


app = FastAPI()


def auth_check(req):
    user = req.state.get_user()
    if req.url.path.startswith('/api/login_required/'):
        if not user:
            raise HTTPException(401)
    elif req.url.path.startswith('/api/admin_required/'):
        if not user:
            raise HTTPException(401)
        if not user.is_admin():
            raise HTTPException(403)


# make the app authorized
# `check` is optional, it adds a middleware to do custom auth logic
# normally you can just use `auth.User`, `auth.Admin` etc for each endpoint
auth(app, provider=f'http://localhost:{ports.auth_back}', check=auth_check)


# public endpoint
@app.get('/api/public')
def api_public():
    pass


# require login
@app.get('/api/private')
def api_private(user: auth.User):
    pass


# require login (admin)
@app.get('/api/admin')
def get_admin(admin: auth.Admin):
    pass


# protected by auth_check
@app.get('/api/login_required/foo')
def login_required_foo():
    pass


# protected by auth_check
@app.get('/api/login_required/bar')
def login_required_bar():
    pass


# protected by auth_check
@app.get('/api/admin_required/foo')
def admin_required_foo():
    pass


# protected by auth_check
@app.get('/api/admin_required/bar')
def admin_required_bar():
    pass


if __name__ == '__main__':
    import uvicorn
    from fans.ports import ports

    uvicorn.run(app, port=ports.auth_res_back)
