FROM python:3.13-bookworm

RUN pip install pipenv

COPY ./fansauth/Pipfile /app/fansauth/fansauth/Pipfile
COPY ./fansauth/Pipfile.lock /app/fansauth/fansauth/Pipfile.lock

WORKDIR /app/fansauth/fansauth
RUN pipenv install
RUN pipenv install --dev

WORKDIR /app

COPY ./fansauth /app/fansauth
COPY ./web/dist /app/web/dist

CMD PIPENV_PIPFILE="/app/fansauth/fansauth/Pipfile" pipenv run python -m fansauth serve
