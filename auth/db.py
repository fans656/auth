from pathlib import Path

import peewee


class User(peewee.Model):

    username = peewee.TextField(primary_key=True)
    hashed_password = peewee.TextField()
    salt = peewee.TextField()
    meta = peewee.TextField(null=True)


tables = [
    User,
]


def init_database(database_path: Path):
    database = peewee.SqliteDatabase(database_path)
    database.bind(tables)
    database.create_tables(tables)
    return database
