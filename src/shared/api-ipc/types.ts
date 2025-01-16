export type IpcResult<T> =
  | {
      code?: string;
      error: string;
    }
  | {
      data: T;
    };
