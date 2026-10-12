import bcrypt from 'bcryptjs';
import { User, type UserRole } from '../models/User';
import { AppError } from '../utils/AppError';
import type { LoginInput, SignupInput } from '../validation/auth.schemas';
import { signToken } from './token';

const BCRYPT_ROUNDS = 10;

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResult {
  token: string;
  user: UserDTO;
}

function toAuthResult(user: { id: string; name: string; email: string; role: UserRole }): AuthResult {
  const dto: UserDTO = { id: user.id, name: user.name, email: user.email, role: user.role };
  return { token: signToken({ userId: dto.id, role: dto.role }), user: dto };
}

export async function signup(input: SignupInput): Promise<AuthResult> {
  if (await User.exists({ email: input.email })) {
    throw AppError.conflict('An account with this email already exists. Please log in instead.');
  }
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await User.create({ name: input.name, email: input.email, passwordHash, role: input.role });
  return toAuthResult(user);
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  // Same message for unknown email and wrong password, so the API doesn't reveal which emails are registered.
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw AppError.unauthorized('Email or password is incorrect.');
  }
  return toAuthResult(user);
}

export async function getUserById(userId: string): Promise<UserDTO> {
  const user = await User.findById(userId);
  if (!user) {
    throw AppError.unauthorized('Your account no longer exists. Please sign up again.');
  }
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
