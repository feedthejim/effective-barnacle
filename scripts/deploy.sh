#!/bin/sh

if ! docker network ls | grep traefik_default; then
    docker network create traefik_default
fi

docker-compose build

docker-compose up -d reverse-proxy mongodb orchestrator
