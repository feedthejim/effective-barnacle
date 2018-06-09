# Effective Barnacle Orchestrator

This project uses Traefik...

# Environment variables

* `EB_ORCHESTRATOR_PORT` (default `9000`)
* `EB_ORCHESTRATOR_SECRET` (default `secret`)
* `EB_SERVER_DOCKER_IMAGE` (default `effective-barnacle_backend`)
* `EB_DOMAIN_NAME` (default `localhost`)
* `EB_MAX_CLIENTS_PER_SERVER` (default `5`)
* `EB_DEFAULT_SERVERS_NB` (default `5`)
* `EB_MONGO_HOST` (default `localhost`)

# Routes

* `/connect`

Returns the first free server.

* `/confirm/:serverId`

Secure way to register a user to a server.

* `/disconnect/:serverId`

Disconnect the user from the server.

* `/admin`

Admin page.
