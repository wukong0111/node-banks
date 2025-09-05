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

export class ResultBuilder {
  static success<T>(data: T): Success<T> {
    return {
      success: true,
      data
    };
  }

  static failure<E = string>(error: E): Failure<E> {
    return {
      success: false,
      error,
      timestamp: new Date().toISOString()
    };
  }
}