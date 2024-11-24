root=$(dirname $(dirname $(realpath $0)))

PIPENV_PIPFILE="$root/auth/Pipfile" pipenv run python -m auth serve $@
