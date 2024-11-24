FROM python:3.10-bookworm

RUN pip install pipenv

WORKDIR /app/auth/auth
COPY ./auth/Pipfile Pipfile
COPY ./auth/Pipfile.lock Pipfile.lock

WORKDIR /app/auth/auth
RUN pipenv install

WORKDIR /app

COPY ./auth /app/auth
COPY ./frontend/dist /app/frontend/dist

CMD PIPENV_PIPFILE="/app/auth/auth/Pipfile" pipenv run python -m auth serve
