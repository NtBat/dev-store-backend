import { Router, Response } from 'express';
import * as bannerController from '../controllers/banner';
import * as productController from '../controllers/product';
import * as categoryController from '../controllers/category';
import * as cartController from '../controllers/cart';
import * as shippingController from '../controllers/shipping';
import * as userController from '../controllers/user';
import { authMiddleware } from '../middleware/auth';
import * as webhookController from '../controllers/webhook';
import * as orderController from '../controllers/order';
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
routes.post('/cart/finish', authMiddleware, cartController.finishCart);

routes.post('/user/register', userController.createUser);
routes.post('/user/login', userController.loginUser);
routes.post('/user/addresses', authMiddleware, userController.createUserAddress);
routes.get('/user/addresses', authMiddleware, userController.getUserAddresses);

routes.post('/webhook/stripe', webhookController.stripe);

routes.get('/orders/session', orderController.getOrderBySessionId);
routes.get('/user/orders', authMiddleware, orderController.listOrders);
