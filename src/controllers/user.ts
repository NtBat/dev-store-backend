import { RequestHandler, Request, Response } from 'express';
import { createUserSchema } from '../schemas/create-user-schema';
import { createUser as createUserService } from '../services/user';

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
