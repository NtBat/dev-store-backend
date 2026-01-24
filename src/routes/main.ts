import { Router, Response } from 'express';
import * as bannerController from '../controllers/banner';
import * as productController from '../controllers/product';
import * as categoryController from '../controllers/category';
import * as cartController from '../controllers/cart';
import * as shippingController from '../controllers/shipping';
export const routes = Router();

routes.get('/ping', (_, res: Response) => {
  res.json({ pong: true });
});

routes.get('/banners', bannerController.getBanners);
routes.get('/products', productController.getProducts);
routes.get('/products/:id', productController.getProductById);
routes.get('/products/:id/related', productController.getProductRelated);
routes.get('/category/:slug/metadata', categoryController.getCategoryWithMetadata);
routes.post('/cart/mount', cartController.createCart);
routes.get('/cart/shipping', shippingController.getCartShipping);
