import * as express from 'express';

export default function cors(req: express.Request, res: express.Response,
                             next: express.NextFunction) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
}
