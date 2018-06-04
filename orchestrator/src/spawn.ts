import * as Docker from 'dockerode';
import * as shortid from 'shortid';

import { Server, IServer } from './models/server';

const SERVER_IMAGE = process.env.EB_SERVER_DOCKER_IMAGE || 'eb-back';
const DOMAIN_NAME = process.env.EB_DOMAIN_NAME || 'localhost';

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

export default async function spawnServer(servers: IServer[]): Promise<IServer> {
  const _id = shortid.generate();
  const url = `eb-arena-${_id}.${DOMAIN_NAME}`;
  const port = await getUnusedPort(servers);

  docker.run(SERVER_IMAGE, ['yarn', 'start', '--', `${port}`], null, {
    Labels: {
      'traefik.enable': 'true',
      'traefik.frontend.rule': `Host:${url}`,
      'traefik.docker.network': 'traefik_default',
    },
    ExposedPorts: { [`${port}/tcp`]: {} },
    NetworkMode: 'traefik_default',
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
