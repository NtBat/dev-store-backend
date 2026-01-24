import { RequestHandler, Request, Response } from 'express';
import { createUserSchema, loginUserSchema } from '../schemas/user-schema';
import { createUser as createUserService, loginUser as loginUserService } from '../services/user';

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
