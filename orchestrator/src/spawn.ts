import * as Docker from 'dockerode';
import * as shortid from 'shortid';

import { Server, IServer } from './models/server';
import { DOMAIN_NAME, SERVER_IMAGE, SECRET } from './env';

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

  docker.run(SERVER_IMAGE, ['yarn', 'start'], null, {
    Labels: {
      'traefik.enable': 'true',
      'traefik.frontend.rule': `Host:${url}`,
      'traefik.docker.network': 'traefik_default',
    },
    ExposedPorts: { [`${port}/tcp`]: {} },
    NetworkMode: 'traefik_default',
    Env: [
      `EB_SERVER_ID=${_id}`,
      `EB_SERVER_PORT=${port}`,
      `EB_SERVER_SECRET=${SECRET}`,
      `EB_ORCHESTRATOR_URL=orchestrator.${DOMAIN_NAME}`,
    ],
    name: _id,
  });

  const server = new Server({
    _id,
    url,
    port,
    clients: 0,
  });

  server.save();

  return server;
}
