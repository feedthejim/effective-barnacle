import * as express from 'express';
import * as mongoose from 'mongoose';

import basicAuth from './middlewares/auth';
import cors from './middlewares/cors';
import connect from './routes/connect';
import disconnect from './routes/disconnect';
import admin from './routes/admin';
import confirm from './routes/confirm';
import { Server } from './models/server';
import spawnServer from './spawn';
import { MONGO_HOST, PORT, DEFAULT_SERVERS_NB } from './env';

mongoose.connect(`mongodb://${MONGO_HOST}/barnacle`);

const app = express();

app.use(cors);

app.set('view engine', 'ejs');

app.get('/connect', connect);
app.get('/confirm/:serverId', basicAuth, confirm);
app.get('/disconnect/:serverId', disconnect);
app.get('/', basicAuth, admin);

app.listen(PORT, async () => {
  for (let i = 0; i < DEFAULT_SERVERS_NB; ++i) {
    spawnServer(await Server.find({}).exec());
  }
  console.log(`App serving on http://localhost:${PORT}`);
});
