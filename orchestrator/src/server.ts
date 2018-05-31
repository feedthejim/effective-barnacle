import * as express from 'express';
import * as mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/barnacle');

import connect from './routes/connect';
import disconnect from './routes/disconnect';

const PORT = process.env.EB_ORCHESTRATOR_PORT || 9000;

const app = express();

app.get('/connect', connect);
app.get('/disconnect/:serverId', disconnect);

app.listen(PORT, () => {
  // FIXME: spawn X start servers
  console.log(`App serving on http://localhost:${PORT}`);
});
