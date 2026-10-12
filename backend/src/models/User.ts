import { Schema, model } from 'mongoose';

export const USER_ROLES = ['brand', 'creator'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Excluded from queries by default so it can never leak into a response by accident.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, required: true },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
