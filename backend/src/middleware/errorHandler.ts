import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export interface ErrorResponseBody {
  error: string;
  details?: { field: string; message: string }[];
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} does not exist.`));
};

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === 11000;
}

function isJsonSyntaxError(err: unknown): boolean {
  return err instanceof SyntaxError && 'type' in err && err.type === 'entity.parse.failed';
}

/**
 * Single place that turns errors into HTTP responses. Express 5 forwards
 * rejected promises from async handlers here automatically.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let status = 500;
  let body: ErrorResponseBody = { error: 'Something went wrong. Please try again.' };

  if (err instanceof ZodError) {
    status = 400;
    body = {
      error: err.issues[0]?.message ?? 'The request is invalid.',
      details: err.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
    };
  } else if (err instanceof AppError) {
    status = err.statusCode;
    body = { error: err.message };
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    body = { error: `The ${err.path === '_id' ? 'id' : err.path} in the request is not valid.` };
  } else if (isDuplicateKeyError(err)) {
    status = 409;
    body = { error: 'This record already exists.' };
  } else if (isJsonSyntaxError(err)) {
    status = 400;
    body = { error: 'The request body must be valid JSON.' };
  }

  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json(body);
};
