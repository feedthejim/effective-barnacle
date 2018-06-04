import * as Docker from 'dockerode';
import * as express from 'express';
import * as shortid from 'shortid';

import { Server, IServer } from '../models/server';
import spawnServer from '../spawn';

const MAX_CLIENTS_PER_SERVER = process.env.EB_MAX_CLIENTS_PER_SERVER || 5;

function findFreeServer(servers: IServer[]): IServer {
  return servers.find((server: IServer) => server.clients < MAX_CLIENTS_PER_SERVER);
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
