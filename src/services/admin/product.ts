import { prisma } from '../../libs/prisma';

type GetProductsFilters = {
  page?: number;
  limit?: number;
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
};

type CreateProductData = {
  label: string;
  labelEn?: string;
  price: number;
  description?: string;
  descriptionEn?: string;
  categoryId: number;
};

type VariantUpdateItem = {
  id?: number;
  size: string;
  stock: number;
};

type ImageUpdateItem = {
  id?: number;
  url: string;
};

type UpdateProductData = {
  label?: string;
  labelEn?: string;
  price?: number;
  description?: string;
  descriptionEn?: string;
  categoryId?: number;
  variants?: VariantUpdateItem[];
  images?: ImageUpdateItem[];
};

export const getAllProducts = async (filters: GetProductsFilters) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.search) {
    where.OR = [
      { label: { contains: filters.search, mode: 'insensitive' } },
      { labelEn: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { descriptionEn: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        label: true,
        labelEn: true,
        price: true,
        categoryId: true,
        viewsCount: true,
        salesCount: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            nameEn: true,
          },
        },
        images: {
          take: 1,
          orderBy: {
            id: 'asc',
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      label: true,
      labelEn: true,
      price: true,
      description: true,
      descriptionEn: true,
      categoryId: true,
      viewsCount: true,
      salesCount: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          nameEn: true,
          slug: true,
        },
      },
      images: {
        select: {
          id: true,
          url: true,
        },
        orderBy: {
          id: 'asc',
        },
      },
      variants: {
        select: {
          id: true,
          size: true,
          stock: true,
        },
        orderBy: {
          size: 'asc',
        },
      },
      metadata: {
        select: {
          id: true,
          categoryMetadataId: true,
          metadataValueId: true,
        },
      },
      _count: {
        select: {
          favorites: true,
          orders: true,
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  return product;
};

export const createProduct = async (data: CreateProductData) => {
  const product = await prisma.product.create({
    data: {
      label: data.label,
      labelEn: data.labelEn || null,
      price: data.price,
      description: data.description || null,
      descriptionEn: data.descriptionEn || null,
      categoryId: data.categoryId,
    },
    select: {
      id: true,
      label: true,
      labelEn: true,
      price: true,
      description: true,
      descriptionEn: true,
      categoryId: true,
      viewsCount: true,
      salesCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return product;
};

export const updateProduct = async (id: number, data: UpdateProductData) => {
  const productData: Record<string, unknown> = {
    ...(data.label !== undefined && { label: data.label }),
    ...(data.labelEn !== undefined && { labelEn: data.labelEn || null }),
    ...(data.price !== undefined && { price: data.price }),
    ...(data.description !== undefined && { description: data.description || null }),
    ...(data.descriptionEn !== undefined && { descriptionEn: data.descriptionEn || null }),
    ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
  };

  if (data.variants && data.variants.length > 0) {
    for (const variant of data.variants) {
      if (variant.id) {
        const existing = await prisma.productVariant.findFirst({
          where: { id: variant.id, productId: id },
        });
        if (existing) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: { size: variant.size, stock: variant.stock },
          });
        }
      } else {
        await prisma.productVariant.upsert({
          where: {
            productId_size: { productId: id, size: variant.size },
          },
          create: {
            productId: id,
            size: variant.size,
            stock: variant.stock,
          },
          update: { stock: variant.stock },
        });
      }
    }
  }

  if (data.images !== undefined) {
    const currentImages = await prisma.productImage.findMany({
      where: { productId: id },
      select: { id: true },
    });
    const currentIds = new Set(currentImages.map((img) => img.id));
    const idsToKeep = new Set(
      data.images
        .filter((img): img is ImageUpdateItem & { id: number } => typeof img.id === 'number')
        .map((img) => img.id)
    );

    for (const image of data.images) {
      if (image.id) {
        const belongsToProduct = await prisma.productImage.findFirst({
          where: { id: image.id, productId: id },
        });
        if (belongsToProduct) {
          await prisma.productImage.update({
            where: { id: image.id },
            data: { url: image.url },
          });
        }
      } else {
        await prisma.productImage.create({
          data: { productId: id, url: image.url },
        });
      }
    }

    const idsToDelete = [...currentIds].filter((imgId) => !idsToKeep.has(imgId));
    if (idsToDelete.length > 0) {
      await prisma.productImage.deleteMany({
        where: { id: { in: idsToDelete }, productId: id },
      });
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: productData,
    select: {
      id: true,
      label: true,
      labelEn: true,
      price: true,
      description: true,
      descriptionEn: true,
      categoryId: true,
      viewsCount: true,
      salesCount: true,
      createdAt: true,
      updatedAt: true,
      variants: {
        select: {
          id: true,
          size: true,
          stock: true,
        },
        orderBy: { size: 'asc' },
      },
      images: {
        select: {
          id: true,
          url: true,
        },
        orderBy: { id: 'asc' },
      },
    },
  });

  return product;
};

export const deleteProduct = async (id: number) => {
  await prisma.product.delete({
    where: { id },
  });
};

export const addProductImage = async (productId: number, url: string) => {
  const image = await prisma.productImage.create({
    data: {
      productId,
      url,
    },
  });

  return image;
};

export const deleteProductImage = async (imageId: number) => {
  await prisma.productImage.delete({
    where: { id: imageId },
  });
};

export const addProductVariant = async (productId: number, size: string, stock: number) => {
  const variant = await prisma.productVariant.create({
    data: {
      productId,
      size,
      stock,
    },
  });

  return variant;
};

export const deleteProductVariant = async (variantId: number) => {
  await prisma.productVariant.delete({
    where: { id: variantId },
  });
};

export const getProductStats = async () => {
  const [totalProducts, topSelling, mostViewed, mostFavorited, outOfStock] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      select: {
        id: true,
        label: true,
        labelEn: true,
        salesCount: true,
        price: true,
        variants: {
          select: {
            size: true,
            stock: true,
          },
        },
        images: {
          take: 1,
          orderBy: { id: 'asc' },
        },
      },
      orderBy: {
        salesCount: 'desc',
      },
      take: 10,
    }),
    prisma.product.findMany({
      select: {
        id: true,
        label: true,
        labelEn: true,
        viewsCount: true,
        price: true,
        variants: {
          select: {
            size: true,
            stock: true,
          },
        },
        images: {
          take: 1,
          orderBy: { id: 'asc' },
        },
      },
      orderBy: {
        viewsCount: 'desc',
      },
      take: 10,
    }),
    prisma.product.findMany({
      select: {
        id: true,
        label: true,
        labelEn: true,
        price: true,
        images: {
          take: 1,
          orderBy: { id: 'asc' },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy: {
        favorites: {
          _count: 'desc',
        },
      },
      take: 10,
    }),
    prisma.product.findMany({
      where: {
        variants: {
          every: {
            stock: 0,
          },
        },
      },
      select: {
        id: true,
        label: true,
        labelEn: true,
        price: true,
        variants: {
          select: {
            size: true,
            stock: true,
          },
        },
        images: {
          take: 1,
          orderBy: { id: 'asc' },
        },
      },
    }),
  ]);

  return {
    totalProducts,
    topSelling,
    mostViewed,
    mostFavorited,
    outOfStock,
  };
};
