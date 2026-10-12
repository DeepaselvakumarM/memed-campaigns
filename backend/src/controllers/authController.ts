import type { Request, Response } from 'express';
import { getAuth } from '../middleware/auth';
import * as authService from '../services/authService';
import { loginSchema, signupSchema } from '../validation/auth.schemas';

export async function signup(req: Request, res: Response): Promise<void> {
  const input = signupSchema.parse(req.body);
  res.status(201).json(await authService.signup(input));
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);
  res.json(await authService.login(input));
}

export async function me(req: Request, res: Response): Promise<void> {
  res.json({ user: await authService.getUserById(getAuth(req).userId) });
}
