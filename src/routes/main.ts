import { Router, Response } from 'express';
import * as bannerController from '../controllers/banner';
import * as productController from '../controllers/product';
import * as categoryController from '../controllers/category';
import * as cartController from '../controllers/cart';
import * as shippingController from '../controllers/shipping';
import * as userController from '../controllers/user';
import { authMiddleware, adminMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import * as webhookController from '../controllers/webhook';
import * as orderController from '../controllers/order';
import * as storeController from '../controllers/store';
import * as favoriteController from '../controllers/favorite';
import * as ratingController from '../controllers/rating';
import * as adminUserController from '../controllers/admin/user';
import * as adminBannerController from '../controllers/admin/banner';
import * as adminProductController from '../controllers/admin/product';
import * as adminOrderController from '../controllers/admin/order';
import * as adminDashboardController from '../controllers/admin/dashboard';
import * as adminRatingController from '../controllers/admin/rating';
export const routes = Router();

routes.get('/ping', (_, res: Response) => {
  res.json({ pong: true });
});

routes.get('/banners', bannerController.getBanners);

routes.get('/products', optionalAuthMiddleware, productController.getProducts);
routes.get('/products/:id', optionalAuthMiddleware, productController.getProductById);
routes.get('/products/:id/related', optionalAuthMiddleware, productController.getProductRelated);

routes.post('/products/:id/ratings', authMiddleware, ratingController.createRating);
routes.get('/products/:id/ratings', ratingController.getProductRatings);

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
routes.get('/user/me', authMiddleware, userController.getUserProfile);
routes.put('/user/me', authMiddleware, userController.updateUserProfile);
routes.post('/user/addresses', authMiddleware, userController.createUserAddress);
routes.get('/user/addresses', authMiddleware, userController.getUserAddresses);
routes.put('/user/addresses/:id', authMiddleware, userController.updateUserAddress);
routes.delete('/user/addresses/:id', authMiddleware, userController.deleteUserAddress);

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

// Favorites routes - User
routes.post('/user/favorites', authMiddleware, favoriteController.addToFavorites);
routes.delete('/user/favorites/:productId', authMiddleware, favoriteController.removeFromFavorites);
routes.get('/user/favorites', authMiddleware, favoriteController.getUserFavorites);

// Favorites routes - Admin only
routes.get(
  '/admin/favorites',
  authMiddleware,
  adminMiddleware,
  favoriteController.getAllFavoritesGrouped
);

// Users routes - Admin only
routes.post('/admin/users', authMiddleware, adminMiddleware, adminUserController.createUser);
routes.get('/admin/users', authMiddleware, adminMiddleware, adminUserController.getAllUsers);
routes.get(
  '/admin/users/stats',
  authMiddleware,
  adminMiddleware,
  adminUserController.getUsersStats
);
routes.get('/admin/users/:id', authMiddleware, adminMiddleware, adminUserController.getUserById);
routes.put('/admin/users/:id', authMiddleware, adminMiddleware, adminUserController.updateUser);
routes.delete('/admin/users/:id', authMiddleware, adminMiddleware, adminUserController.deleteUser);

// Banners routes - Admin only
routes.get('/admin/banners', authMiddleware, adminMiddleware, adminBannerController.getAllBanners);
routes.put(
  '/admin/banners/reorder',
  authMiddleware,
  adminMiddleware,
  adminBannerController.reorderBanners
);
routes.get(
  '/admin/banners/:id',
  authMiddleware,
  adminMiddleware,
  adminBannerController.getBannerById
);
routes.post('/admin/banners', authMiddleware, adminMiddleware, adminBannerController.createBanner);
routes.put(
  '/admin/banners/:id',
  authMiddleware,
  adminMiddleware,
  adminBannerController.updateBanner
);
routes.delete(
  '/admin/banners/:id',
  authMiddleware,
  adminMiddleware,
  adminBannerController.deleteBanner
);

// Products routes - Admin only
routes.get(
  '/admin/products/stats',
  authMiddleware,
  adminMiddleware,
  adminProductController.getProductStats
);
routes.get(
  '/admin/products',
  authMiddleware,
  adminMiddleware,
  adminProductController.getAllProducts
);
routes.get(
  '/admin/products/:id',
  authMiddleware,
  adminMiddleware,
  adminProductController.getProductById
);
routes.post(
  '/admin/products',
  authMiddleware,
  adminMiddleware,
  adminProductController.createProduct
);
routes.put(
  '/admin/products/:id',
  authMiddleware,
  adminMiddleware,
  adminProductController.updateProduct
);
routes.delete(
  '/admin/products/:id',
  authMiddleware,
  adminMiddleware,
  adminProductController.deleteProduct
);
routes.post(
  '/admin/products/:id/images',
  authMiddleware,
  adminMiddleware,
  adminProductController.addProductImage
);
routes.delete(
  '/admin/products/images/:imageId',
  authMiddleware,
  adminMiddleware,
  adminProductController.deleteProductImage
);
routes.post(
  '/admin/products/:id/variants',
  authMiddleware,
  adminMiddleware,
  adminProductController.addProductVariant
);
routes.delete(
  '/admin/products/variants/:variantId',
  authMiddleware,
  adminMiddleware,
  adminProductController.deleteProductVariant
);

// Orders routes - Admin only
routes.get(
  '/admin/orders/stats',
  authMiddleware,
  adminMiddleware,
  adminOrderController.getOrdersStats
);
routes.get('/admin/orders', authMiddleware, adminMiddleware, adminOrderController.getAllOrders);
routes.get('/admin/orders/:id', authMiddleware, adminMiddleware, adminOrderController.getOrderById);
routes.put(
  '/admin/orders/:id/status',
  authMiddleware,
  adminMiddleware,
  adminOrderController.updateOrderStatus
);

// Dashboard routes - Admin only
routes.get(
  '/admin/dashboard',
  authMiddleware,
  adminMiddleware,
  adminDashboardController.getDashboardMetrics
);
routes.get(
  '/admin/dashboard/revenue-chart',
  authMiddleware,
  adminMiddleware,
  adminDashboardController.getRevenueChart
);
routes.get(
  '/admin/dashboard/orders-chart',
  authMiddleware,
  adminMiddleware,
  adminDashboardController.getOrdersChart
);
routes.get(
  '/admin/dashboard/top-products',
  authMiddleware,
  adminMiddleware,
  adminDashboardController.getTopProducts
);

routes.get('/admin/ratings', authMiddleware, adminMiddleware, adminRatingController.getAllRatings);
routes.get(
  '/admin/ratings/:id',
  authMiddleware,
  adminMiddleware,
  adminRatingController.getRatingById
);
routes.put(
  '/admin/ratings/:id/status',
  authMiddleware,
  adminMiddleware,
  adminRatingController.updateRatingStatus
);
routes.delete(
  '/admin/ratings/:id',
  authMiddleware,
  adminMiddleware,
  adminRatingController.deleteRating
);
