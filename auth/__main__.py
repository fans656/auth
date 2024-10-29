import click
import uvicorn
from fans.ports import ports

from auth.app import app


@click.group()
def cli():
    pass


@cli.command()
def serve():
    uvicorn.run(app, host='0.0.0.0', port=ports.auth)


if __name__ == '__main__':
    cli()
