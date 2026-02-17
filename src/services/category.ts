import { prisma } from '../libs/prisma';

export const getCategory = async (id: number) => {
  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      nameEn: true,
      slug: true,
    },
  });

  return category;
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findFirst({
    where: { slug },
    select: {
      id: true,
      name: true,
      nameEn: true,
      slug: true,
    },
  });

  return category;
};

export const getCategoryMetadata = async (id: number) => {
  const metadata = await prisma.categoryMetadata.findMany({
    where: { categoryId: id },
    select: {
      id: true,
      name: true,
      nameEn: true,
      values: {
        select: {
          id: true,
          label: true,
          labelEn: true,
        },
      },
    },
  });

  return metadata;
};

export const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      nameEn: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return categories;
};

export const createCategory = async (data: { name: string; nameEn?: string; slug: string }) => {
  // Check if slug already exists
  const existingCategory = await prisma.category.findUnique({
    where: { slug: data.slug },
  });

  if (existingCategory) {
    return null;
  }

  const category = await prisma.category.create({
    data: {
      name: data.name,
      nameEn: data.nameEn,
      slug: data.slug,
    },
  });

  return category;
};

export const updateCategory = async (
  id: number,
  data: { name?: string; nameEn?: string; slug?: string }
) => {
  // If updating slug, check if it already exists
  if (data.slug) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        slug: data.slug,
        NOT: { id },
      },
    });

    if (existingCategory) {
      return null;
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data,
  });

  return category;
};

export const deleteCategory = async (id: number) => {
  // Check if category has products
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    return { error: 'Category not found' };
  }

  if (category._count.products > 0) {
    return { error: 'Cannot delete category with products' };
  }

  await prisma.category.delete({
    where: { id },
  });

  return { success: true };
};

export const createCategoryMetadata = async (data: {
  id: string;
  name: string;
  nameEn?: string;
  categoryId: number;
}) => {
  // Check if metadata id already exists
  const existingMetadata = await prisma.categoryMetadata.findUnique({
    where: { id: data.id },
  });

  if (existingMetadata) {
    return null;
  }

  const metadata = await prisma.categoryMetadata.create({
    data: {
      id: data.id,
      name: data.name,
      nameEn: data.nameEn,
      categoryId: data.categoryId,
    },
  });

  return metadata;
};

export const updateCategoryMetadata = async (
  id: string,
  data: { name?: string; nameEn?: string }
) => {
  const metadata = await prisma.categoryMetadata.update({
    where: { id },
    data,
  });

  return metadata;
};

export const deleteCategoryMetadata = async (id: string) => {
  await prisma.categoryMetadata.delete({
    where: { id },
  });

  return { success: true };
};

export const createMetadataValue = async (data: {
  id: string;
  label: string;
  labelEn?: string;
  categoryMetadataId: string;
}) => {
  // Check if value id already exists
  const existingValue = await prisma.metadataValue.findUnique({
    where: { id: data.id },
  });

  if (existingValue) {
    return null;
  }

  const value = await prisma.metadataValue.create({
    data: {
      id: data.id,
      label: data.label,
      labelEn: data.labelEn,
      categoryMetadataId: data.categoryMetadataId,
    },
  });

  return value;
};

export const updateMetadataValue = async (id: string, data: { label?: string; labelEn?: string }) => {
  const value = await prisma.metadataValue.update({
    where: { id },
    data,
  });

  return value;
};

export const deleteMetadataValue = async (id: string) => {
  await prisma.metadataValue.delete({
    where: { id },
  });

  return { success: true };
};
