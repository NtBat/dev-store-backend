import { Router, Response } from 'express';

export const routes = Router();

routes.get('/ping', (_, res: Response) => {
  res.json({ pong: true });
});
