import { Request, RequestHandler, Response } from 'express';
import { getCategoryMetadataSchema } from '../schemas/get-category-metadata-schema';
import * as categoryService from '../services/category';

export const getCategoryWithMetadata: RequestHandler = async (req: Request, res: Response) => {
  const paramsResult = getCategoryMetadataSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: 'Invalid query parameters' });
    return;
  }

  const { slug } = paramsResult.data;
  const category = await categoryService.getCategoryBySlug(slug);
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  const metadata = await categoryService.getCategoryMetadata(category.id);

  res.json({ error: null, category, metadata });
};

export const getAllCategories: RequestHandler = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

export const createCategory: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { name, nameEn, slug } = req.body;

    if (!name || !slug) {
      res.status(400).json({ error: 'name and slug are required' });
      return;
    }

    const category = await categoryService.createCategory({ name, nameEn, slug });

    if (!category) {
      res.status(400).json({ error: 'Category with this slug already exists' });
      return;
    }

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, nameEn, slug } = req.body;

    const category = await categoryService.updateCategory(Number(id), { name, nameEn, slug });

    if (!category) {
      res.status(400).json({ error: 'Category with this slug already exists' });
      return;
    }

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await categoryService.deleteCategory(Number(id));

    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

export const createCategoryMetadata: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { id, name, nameEn } = req.body;

    if (!id || !name) {
      res.status(400).json({ error: 'id and name are required' });
      return;
    }

    const metadata = await categoryService.createCategoryMetadata({
      id,
      name,
      nameEn,
      categoryId: Number(categoryId),
    });

    if (!metadata) {
      res.status(400).json({ error: 'Metadata with this id already exists' });
      return;
    }

    res.status(201).json(metadata);
  } catch (error) {
    console.error('Error creating category metadata:', error);
    res.status(500).json({ error: 'Failed to create category metadata' });
  }
};

export const updateCategoryMetadata: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, nameEn } = req.body;

    const metadata = await categoryService.updateCategoryMetadata(id as string, { name, nameEn });

    res.json(metadata);
  } catch (error) {
    console.error('Error updating category metadata:', error);
    res.status(500).json({ error: 'Failed to update category metadata' });
  }
};

export const deleteCategoryMetadata: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await categoryService.deleteCategoryMetadata(id as string);

    res.json(result);
  } catch (error) {
    console.error('Error deleting category metadata:', error);
    res.status(500).json({ error: 'Failed to delete category metadata' });
  }
};

export const createMetadataValue: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { metadataId } = req.params;
    const { id, label, labelEn } = req.body;

    if (!id || !label) {
      res.status(400).json({ error: 'id and label are required' });
      return;
    }

    const value = await categoryService.createMetadataValue({
      id,
      label,
      labelEn,
      categoryMetadataId: metadataId as string,
    });

    if (!value) {
      res.status(400).json({ error: 'Metadata value with this id already exists' });
      return;
    }

    res.status(201).json(value);
  } catch (error) {
    console.error('Error creating metadata value:', error);
    res.status(500).json({ error: 'Failed to create metadata value' });
  }
};

export const updateMetadataValue: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { label, labelEn } = req.body;

    const value = await categoryService.updateMetadataValue(id as string, { label, labelEn });

    res.json(value);
  } catch (error) {
    console.error('Error updating metadata value:', error);
    res.status(500).json({ error: 'Failed to update metadata value' });
  }
};

export const deleteMetadataValue: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await categoryService.deleteMetadataValue(id as string);

    res.json(result);
  } catch (error) {
    console.error('Error deleting metadata value:', error);
    res.status(500).json({ error: 'Failed to delete metadata value' });
  }
};
