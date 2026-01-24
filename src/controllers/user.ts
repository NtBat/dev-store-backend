import { RequestHandler, Request, Response } from 'express';
import { createUserSchema, loginUserSchema } from '../schemas/user-schema';
import { createUser as createUserService, loginUser as loginUserService } from '../services/user';
import { addAddressSchema } from '../schemas/add-address-schema';
import {
  createUserAddress as createUserAddressService,
  getUserAddresses as getUserAddressesService,
} from '../services/user';
import { Address } from '../types/address';

export const createUser: RequestHandler = async (req: Request, res: Response) => {
  const parseResult = createUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid request body' });
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
