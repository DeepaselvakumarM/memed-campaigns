/**
 * An expected, client-facing error. Anything thrown that is NOT an AppError
 * is treated as a bug and returned as a generic 500.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string): AppError {
    return new AppError(400, message);
  }

  static unauthorized(message = 'Please log in to continue.'): AppError {
    return new AppError(401, message);
  }

  static forbidden(message = 'You do not have permission to do this.'): AppError {
    return new AppError(403, message);
  }

  static notFound(message: string): AppError {
    return new AppError(404, message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, message);
  }
}
