import * as express from 'express';
import * as mongoose from 'mongoose';

const MONGO_HOST = process.env.EB_MONGO_HOST || 'localhost';
mongoose.connect(`mongodb://${MONGO_HOST}/barnacle`);

import connect from './routes/connect';
import disconnect from './routes/disconnect';
import { Server } from './models/server';
import spawnServer from './spawn';

const PORT = process.env.EB_ORCHESTRATOR_PORT || 9000;
const DEFAULT_SERVERS_NB = process.env.EB_DEFAULT_SERVERS_NB || 5;

const app = express();

app.get('/connect', connect);
app.get('/disconnect/:serverId', disconnect);

app.listen(PORT, async () => {
  for (let i = 0; i < DEFAULT_SERVERS_NB; ++i) {
    spawnServer(await Server.find({}).exec());
  }
  console.log(`App serving on http://localhost:${PORT}`);
});
