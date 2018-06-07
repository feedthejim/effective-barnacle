import * as express from 'express';
import * as Docker from 'dockerode';

import { Server, IServer } from '../models/server';
import { DEFAULT_SERVERS_NB } from '../env';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export default async function disconnect(req: express.Request, res: express.Response) {
  const { serverId } = req.params;

  const servers = await Server.find({}).exec();
  const server = servers.find((server: IServer) => server._id === serverId);

  if (!server) {
    res.sendStatus(404);
    return;
  }

  if (servers.length > DEFAULT_SERVERS_NB && server.clients <= 1) {
    server.remove();
    docker.getContainer(serverId).kill().then((container: Docker.Container) => {
      container.remove();
    });
  } else {
    server.clients--;
    server.save();
  }

  res.json(server);
}
