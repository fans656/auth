import requests


def auth(fastapi_app):

    from fastapi import HTTPException, Response

    @fastapi_app.post('/api/grant')
    def api_grant(req: dict, response: Response):
        auth_server = req['auth_server']

        url = f'{auth_server}/api/token'
        json = {
            'grant_type': 'authorization_code',
            'code': req['grant'],
        }
        res = requests.post(url, json=json)

        if res.status_code != 200:
            print(res.status_code, res.text)
            raise HTTPException(400, 'Failed to get token')

        token = res.json()['token']
        response.set_cookie(
            key='token',
            value=token,
            # TODO: set expire
            # max_age=token.expire_seconds,
        )
        return {'token': token}

    return fastapi_app
