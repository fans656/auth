set -e
# ./scripts/build-front.sh
docker buildx build --build-arg http_proxy=http://$HOST:19082 --build-arg https_proxy=http://$HOST:19082 -f Dockerfile -t fans656/auth .
