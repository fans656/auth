from fastapi import FastAPI
from fastapi.responses import FileResponse

from auth import cons


app = FastAPI()


@app.get('/')
async def index():
    return FileResponse(cons.root_dir / 'frontend/dist/index.html')


@app.get('/favicon.ico')
async def favicon():
    return FileResponse(cons.root_dir / 'frontend/dist/favicon.ico')


@app.get('/assets/{path:path}')
async def assets(path):
    return FileResponse(cons.root_dir / 'frontend/dist/assets' / path)
