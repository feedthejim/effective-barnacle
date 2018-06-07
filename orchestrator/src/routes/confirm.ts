import * as express from 'express';

import { Server } from '../models/server';

export default async function connect(req: express.Request, res: express.Response) {
  const { serverId } = req.params;

  const server = await Server.findById(serverId).exec();
  server.clients++;
  server.save();

  res.json(server);
}
