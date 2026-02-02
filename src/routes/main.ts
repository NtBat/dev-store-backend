import { Router, Response } from 'express';
import * as bannerController from '../controllers/banner';
import * as productController from '../controllers/product';
import * as categoryController from '../controllers/category';
import * as cartController from '../controllers/cart';
import * as shippingController from '../controllers/shipping';
import * as userController from '../controllers/user';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import * as webhookController from '../controllers/webhook';
import * as orderController from '../controllers/order';
import * as storeController from '../controllers/store';
export const routes = Router();

routes.get('/ping', (_, res: Response) => {
  res.json({ pong: true });
});

routes.get('/banners', bannerController.getBanners);

routes.get('/products', productController.getProducts);
routes.get('/products/:id', productController.getProductById);
routes.get('/products/:id/related', productController.getProductRelated);

routes.get('/category/:slug/metadata', categoryController.getCategoryWithMetadata);

// Category routes - Admin only
routes.get(
  '/admin/categories',
  authMiddleware,
  adminMiddleware,
  categoryController.getAllCategories
);
routes.post(
  '/admin/categories',
  authMiddleware,
  adminMiddleware,
  categoryController.createCategory
);
routes.put(
  '/admin/categories/:id',
  authMiddleware,
  adminMiddleware,
  categoryController.updateCategory
);
routes.delete(
  '/admin/categories/:id',
  authMiddleware,
  adminMiddleware,
  categoryController.deleteCategory
);

// Category Metadata routes - Admin only
routes.post(
  '/admin/categories/:categoryId/metadata',
  authMiddleware,
  adminMiddleware,
  categoryController.createCategoryMetadata
);
routes.put(
  '/admin/categories/metadata/:id',
  authMiddleware,
  adminMiddleware,
  categoryController.updateCategoryMetadata
);
routes.delete(
  '/admin/categories/metadata/:id',
  authMiddleware,
  adminMiddleware,
  categoryController.deleteCategoryMetadata
);

// Metadata Value routes - Admin only
routes.post(
  '/admin/categories/metadata/:metadataId/values',
  authMiddleware,
  adminMiddleware,
  categoryController.createMetadataValue
);
routes.put(
  '/admin/categories/metadata/values/:id',
  authMiddleware,
  adminMiddleware,
  categoryController.updateMetadataValue
);
routes.delete(
  '/admin/categories/metadata/values/:id',
  authMiddleware,
  adminMiddleware,
  categoryController.deleteMetadataValue
);

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
routes.get('/user/orders/:id', authMiddleware, orderController.getOrder);

// Store routes - Public
routes.get('/store', storeController.getStoreInfo);

// Store routes - Admin only
routes.put('/admin/store', authMiddleware, adminMiddleware, storeController.updateStoreInfo);
routes.post(
  '/admin/store/benefits',
  authMiddleware,
  adminMiddleware,
  storeController.createStoreBenefit
);
routes.put(
  '/admin/store/benefits/:id',
  authMiddleware,
  adminMiddleware,
  storeController.updateStoreBenefit
);
routes.delete(
  '/admin/store/benefits/:id',
  authMiddleware,
  adminMiddleware,
  storeController.deleteStoreBenefit
);
