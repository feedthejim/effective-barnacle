import * as express from 'express';

import { Server } from '../models/server';
import { MAX_CLIENTS_PER_SERVER } from '../env';

export default async function admin(req: express.Request, res: express.Response) {
  const servers = await Server.find({}).exec();

  res.render('admin', {
    servers,
    maxClientsPerServer: MAX_CLIENTS_PER_SERVER,
  });
}
