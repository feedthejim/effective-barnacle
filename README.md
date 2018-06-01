# Effective Barnacle

A super scalable multiplayer game using React, HTML5 Canvas, Websockets, Traefik and Docker, that can handle an infinite number of players.

## Run it

`docker-compose build`

`docker-compose up -d`

This will start a traefik reverse proxy, a mongodb instance and the effective barnacle orchestrator on `localhost:9000`.

## Routes

* `/connect`

* `/disconnect/:serverId`

## Authors

Jimmy Lai <lai_a@epita.fr>

Yannick Utard <utard_y@epita.fr>
