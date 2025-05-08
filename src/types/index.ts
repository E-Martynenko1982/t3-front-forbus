export type Joke = {
  type: string;
  setup: string;
  punchline: string;
  id: number;
};

export enum RequestStatus {
  loading = 'loading',
  succeeded = 'succeeded',
  failed = 'failed',
  success = 'success',
}
