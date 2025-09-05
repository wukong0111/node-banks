export type Result<T, E = string> = Success<T> | Failure<E>;

export interface Success<T> {
  success: true;
  data: T;
}

export interface Failure<E = string> {
  success: false;
  error: E;
  timestamp: string;
}

export function createSuccess<T>(data: T): Success<T> {
  return {
    success: true,
    data
  };
}

export function createFailure<E = string>(error: E): Failure<E> {
  return {
    success: false,
    error,
    timestamp: new Date().toISOString()
  };
}