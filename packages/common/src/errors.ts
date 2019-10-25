export class DetailedError extends Error {
  constructor(public readonly message: string, public readonly details: string, public readonly source?: string) {
    super(message);
    Object.setPrototypeOf(this, DetailedError.prototype);
    Error.captureStackTrace(this, DetailedError);
  }
}

export function isDetailedError(error: any): error is DetailedError {
  return error.details;
}
