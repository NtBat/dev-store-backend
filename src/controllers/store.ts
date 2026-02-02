import { Request, Response } from 'express';
import * as storeService from '../services/store';

export const getStoreInfo = async (req: Request, res: Response) => {
  try {
    const store = await storeService.getStoreInfo();
    res.json(store);
  } catch (error) {
    console.error('Failed to get store info:', error);
    res.status(500).json({ error: 'Failed to get store info' });
  }
};

export const updateStoreInfo = async (req: Request, res: Response) => {
  try {
    const {
      topbarText,
      topbarTextEn,
      instagram,
      facebook,
      email,
      whatsapp,
      copyright,
      copyrightEn,
    } = req.body;

    const store = await storeService.updateStoreInfo({
      topbarText,
      topbarTextEn,
      instagram,
      facebook,
      email,
      whatsapp,
      copyright,
      copyrightEn,
    });

    res.json(store);
  } catch (error) {
    console.error('Failed to update store info:', error);
    res.status(500).json({ error: 'Failed to update store info' });
  }
};

export const createStoreBenefit = async (req: Request, res: Response) => {
  try {
    const { iconName, title, titleEn, description, descriptionEn, order } = req.body;

    if (!iconName || !title || !description) {
      res.status(400).json({ error: 'iconName, title and description are required' });
      return;
    }

    const benefit = await storeService.createStoreBenefit({
      iconName,
      title,
      titleEn,
      description,
      descriptionEn,
      order,
    });

    res.json(benefit);
  } catch (error) {
    console.error('Failed to create store benefit:', error);
    res.status(500).json({ error: 'Failed to create store benefit' });
  }
};

export const updateStoreBenefit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { iconName, title, titleEn, description, descriptionEn, order } = req.body;

    const benefit = await storeService.updateStoreBenefit(Number(id), {
      iconName,
      title,
      titleEn,
      description,
      descriptionEn,
      order,
    });

    res.json(benefit);
  } catch (error) {
    console.error('Failed to update store benefit:', error);
    res.status(500).json({ error: 'Failed to update store benefit' });
  }
};

export const deleteStoreBenefit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await storeService.deleteStoreBenefit(Number(id));

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete store benefit:', error);
    res.status(500).json({ error: 'Failed to delete store benefit' });
  }
};
