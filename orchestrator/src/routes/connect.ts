import * as Docker from 'dockerode';
import * as express from 'express';
import * as shortid from 'shortid';

import { Server, IServer } from '../models/server';

const SERVER_IMAGE = process.env.EB_SERVER_DOCKER_IMAGE || 'eb-back';
const DOMAIN_NAME = process.env.EB_DOMAIN_NAME || 'localhost';
const MAX_CLIENTS_PER_SERVER = process.env.EB_MAX_CLIENTS_PER_SERVER || 5;

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

function generateRandomPort(): number {
  return Math.round(Math.random() * 10000 + 7000);
}

function getUnusedPort(servers: IServer[]): number {
  let randomPort = generateRandomPort();

  while (servers.some((server: IServer) => server.port === randomPort)) {
    randomPort = generateRandomPort();
  }

  return randomPort;
}

function findFreeServer(servers: IServer[]): IServer {
  return servers.find((server: IServer) => server.clients < MAX_CLIENTS_PER_SERVER);
}

async function spawnServer(servers: IServer[]): Promise<IServer> {
  const _id = shortid.generate();
  const url = `eb-arena-${_id}.${DOMAIN_NAME}`;
  const port = await getUnusedPort(servers);

  docker.run(SERVER_IMAGE, ['yarn', 'start', '--', `${port}`], null, {
    Labels: { 'traefik.frontend.rule': `Host:${url}` },
    ExposedPorts: { [`${port}/tcp`]: {} },
    name: _id,
  });

  const server = new Server({
    _id,
    url,
    port,
    clients: 1,
  });

  server.save();

  return server;
}

export default async function connect(req: express.Request, res: express.Response) {
  const servers = await Server.find({}).exec();

  let server = await findFreeServer(servers);

  if (server) {
    server.clients++;
    server.save();
  } else {
    server = await spawnServer(servers);
  }

  res.json(server);
}
