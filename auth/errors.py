from fastapi import HTTPException


class HTTPError(HTTPException):

    def __init__(self):
        super().__init__(self.status_code, self.message)


class WrongUsernameOrPassword(HTTPError):

    status_code = 400
    message = 'Wrong username or password'
