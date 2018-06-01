import * as express from 'express';
import * as Docker from 'dockerode';

import { Server, IServer } from '../models/server';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export default async function disconnect(req: express.Request, res: express.Response) {
  const { serverId } = req.params;

  const server = await Server.findById(serverId).exec();

  if (server.clients <= 1) {
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
