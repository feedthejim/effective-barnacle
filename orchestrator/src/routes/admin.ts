import * as express from 'express';

import { Server } from '../models/server';

export default async function admin(req: express.Request, res: express.Response) {
  const servers = await Server.find({}).exec();

  res.render('admin', {
    servers,
    maxClientsPerServer: process.env.EB_MAX_CLIENTS_PER_SERVER || 5,
  });
}
