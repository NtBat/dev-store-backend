import { Router, Response } from 'express';
import * as bannerController from '../controllers/banner';

export const routes = Router();

routes.get('/ping', (_, res: Response) => {
  res.json({ pong: true });
});

routes.get('/banners', bannerController.getBanners);
