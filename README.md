# Effective Barnacle

A super scalable multiplayer game made with a ton of awesome technologies:
* React, Redux, [Sagas](https://github.com/redux-saga/redux-saga)
* HTML5 Canvas
* WebSocket
* Node
* Docker
* [Traefik](https://traefik.io)

*SCREENSHOTS*

## Run it

One command to run them all (and you just need Docker!):

`./scripts/deploy.sh`

This will start create the `traefik_default` docker network if it doesn't exist yet and then run `docker-compose build`, `docker-compose up -d` wich will start:
* the Effective Barnacle client (`localhost:3000`)
* a Traefik reverse proxy (`localhost:80`)
* a Mongodb instance (`localhost:27017`)
* the Effective Barnacle orchestrator (`localhost:9000`)
* 5 starting instances of the Effective Barnacle server on random unused ports

You can also customize the docker-compose variables (ports, ...) within the `.env` file.

## Shut it down

Just run:

`./scripts/stop.sh`

## Why Effective Barnacle?

School javascript project

Inspired by slither.io

Challenging:
* perfomance with react konva, schemapack, websockets
* autoscaling with traefik and docker

We didn't have much inspiration for the name... So we let GitHub decided for us :D

## How does it work?

one orchestrator, X backends, everything lives within a docker container
orchestrator creates new server instances when servers are full
connect/confirm mechanism to avoid DDOS

## Contributing

Pull requests are very welcomed!

To get started in your contribution, you just need to:

* either use the `./scripts/deploy.sh` script

OR

* install the back, front or orchestrator dependencies `yarn`
* run the dev mode `yarn dev`
* open `localhost:3000`

## Authors

* Jimmy Lai <lai_a@epita.fr>
* Yannick Utard <yannickutard@gmail.com>
