export type TResponse<T = unknown> = {
  data: T;
  succeeded: boolean;
  errors: Array<string>;
  message: string;
};
