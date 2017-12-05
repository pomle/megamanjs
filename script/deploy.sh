#! /usr/bin/env bash

docker build -t pomle/megaman .
docker login -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD"
docker push pomle/megaman
