import * as express from 'express';
import * as auth from 'basic-auth';

import { SECRET } from '../env';

export default function basicAuth(req: express.Request, res: express.Response,
                                  next: express.NextFunction) {
  const user = auth(req);

  if (!user || user['pass'] !== SECRET) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Node"');
    res.end('Unauthorized');
  } else {
    next();
  }
}
