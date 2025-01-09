export type IpcResult<T> =
  | {
      error: string;
    }
  | {
      data: T;
    };
