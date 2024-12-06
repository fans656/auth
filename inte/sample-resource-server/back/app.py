from fansauth import auth
from fastapi import FastAPI, APIRouter


app = FastAPI()
auth(app)


if __name__ == '__main__':
    import uvicorn
    from fans.ports import ports

    uvicorn.run(app, port=ports.auth_res_back)
