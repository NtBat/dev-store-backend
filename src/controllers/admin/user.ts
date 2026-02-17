import { Request, Response } from 'express';
import * as userService from '../../services/admin/user';
import {
  getUsersQuerySchema,
  getUserByIdSchema,
  updateUserSchema,
  createUserSchema,
} from '../../schemas/admin/user-schema';

export const createUser = async (req: Request, res: Response) => {
  try {
    const parseResult = createUserSchema.safeParse(req.body);

    if (!parseResult.success) {
      const details = parseResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json({ error: 'Invalid request body', details });
    }

    const { name, email, password, role } = parseResult.data;

    const user = await userService.createUser({ name, email, password, role });

    if (!user) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    res.status(201).json({ error: null, user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const parseResult = getUsersQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    const { page, limit, search, role } = parseResult.data;

    const result = await userService.getAllUsers({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      role,
    });

    res.json({ error: null, ...result });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const parseResult = getUserByIdSchema.safeParse(req.params);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { id } = parseResult.data;

    const user = await userService.getUserById(parseInt(id));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ error: null, user });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const paramsResult = getUserByIdSchema.safeParse(req.params);
    const bodyResult = updateUserSchema.safeParse(req.body);

    if (!paramsResult.success) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    if (!bodyResult.success) {
      const details = bodyResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json({ error: 'Invalid request data', details });
    }

    const { id } = paramsResult.data;
    const { name, email, password, role } = bodyResult.data;

    const user = await userService.updateUser(parseInt(id), { name, email, password, role });

    res.json({ error: null, user });
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (error.code === 'P2002' || error.code === 'EMAIL_TAKEN') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const parseResult = getUserByIdSchema.safeParse(req.params);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { id } = parseResult.data;

    await userService.deleteUser(parseInt(id));

    res.json({ error: null, message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const getUsersStats = async (req: Request, res: Response) => {
  try {
    const stats = await userService.getUsersStats();

    res.json({ error: null, stats });
  } catch (error) {
    console.error('Error getting users stats:', error);
    res.status(500).json({ error: 'Failed to get users stats' });
  }
};
