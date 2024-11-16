import hashlib


def hashed_password(password, salt):
    return hashlib.md5((password + salt).encode()).hexdigest()
