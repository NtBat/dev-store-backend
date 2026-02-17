import { RequestHandler, Request, Response } from 'express';
import {
  createUserSchema,
  loginUserSchema,
  updateUserProfileSchema,
} from '../schemas/user-schema';
import {
  createUser as createUserService,
  loginUser as loginUserService,
  getUserProfile as getUserProfileService,
  updateUserProfile as updateUserProfileService,
} from '../services/user';
import { addAddressSchema } from '../schemas/add-address-schema';
import { addressIdParamSchema } from '../schemas/address-id-param-schema';
import {
  createUserAddress as createUserAddressService,
  getUserAddresses as getUserAddressesService,
  updateUserAddress as updateUserAddressService,
  deleteUserAddress as deleteUserAddressService,
} from '../services/user';
import { Address } from '../types/address';

export const createUser: RequestHandler = async (req: Request, res: Response) => {
  const parseResult = createUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    const details = parseResult.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    res.status(400).json({ error: 'Invalid request body', details });
    return;
  }

  const { name, email, password } = parseResult.data;
  const user = await createUserService(name, email, password);
  if (!user) {
    res.status(400).json({ error: 'User already exists' });
    return;
  }

  res.status(201).json({ error: null, user });
};

export const loginUser: RequestHandler = async (req: Request, res: Response) => {
  const parseResult = loginUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  const { email, password } = parseResult.data;

  const token = await loginUserService(email, password);
  if (!token) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  res.json({ error: null, token });
};

export const getUserProfile: RequestHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = await getUserProfileService(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ error: null, user });
};

export const updateUserProfile: RequestHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const parseResult = updateUserProfileSchema.safeParse(req.body);
  if (!parseResult.success) {
    const details = parseResult.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    res.status(400).json({ error: 'Invalid request body', details });
    return;
  }

  const { name, email, password } = parseResult.data;
  const updateData = { name, email, password };

  const result = await updateUserProfileService(userId, updateData);

  if (result === 'EMAIL_TAKEN') {
    res.status(400).json({ error: 'Email already in use' });
    return;
  }

  if (!result) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ error: null, user: result });
};

export const createUserAddress: RequestHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const parseResult = addAddressSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  const { zipcode, street, number, city, state, country, complement } = parseResult.data;
  const address: Address = {
    zipcode,
    street,
    number,
    city,
    state,
    country,
    complement: complement || '',
  };
  const userAddress = await createUserAddressService(userId, address);
  if (!userAddress) {
    res.status(500).json({ error: 'Failed to create user address' });
    return;
  }

  res.status(201).json({ error: null, address: userAddress });
};

export const getUserAddresses: RequestHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userAddresses = await getUserAddressesService(userId);
  if (!userAddresses) {
    res.status(500).json({ error: 'Failed to get user addresses' });
    return;
  }

  res.json({ error: null, addresses: userAddresses });
};

export const updateUserAddress: RequestHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const paramsResult = addressIdParamSchema.safeParse(req.params);
  const bodyResult = addAddressSchema.safeParse(req.body);

  if (!paramsResult.success) {
    res.status(400).json({ error: 'Invalid address ID' });
    return;
  }

  if (!bodyResult.success) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  const { id } = paramsResult.data;
  const { zipcode, street, number, city, state, country, complement } = bodyResult.data;
  const address: Address = {
    zipcode,
    street,
    number,
    city,
    state,
    country,
    complement: complement || '',
  };

  const updatedAddress = await updateUserAddressService(userId, parseInt(id), address);
  if (!updatedAddress) {
    res.status(404).json({ error: 'Address not found' });
    return;
  }

  res.json({ error: null, address: updatedAddress });
};

export const deleteUserAddress: RequestHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const paramsResult = addressIdParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: 'Invalid address ID' });
    return;
  }

  const { id } = paramsResult.data;
  const deleted = await deleteUserAddressService(userId, parseInt(id));
  if (!deleted) {
    res.status(404).json({ error: 'Address not found' });
    return;
  }

  res.status(204).send();
};
