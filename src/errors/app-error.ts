export interface ErrorDetail {
  field?: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string = 'APP_ERROR',
    public readonly details?: ErrorDetail[]
  ) {
    super(message);
    this.name = 'AppError';
  }
}
