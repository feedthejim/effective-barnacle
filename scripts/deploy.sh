#!/bin/sh

cd ..

docker network create traefik_default

docker-compose build

docker-compose up -d
