export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
  traceId: string;
};

export type ApiEnvelope<T> = {
  data: T | null;
  meta: Record<string, unknown>;
  error: ApiErrorBody | null;
};

export type RegisterSuccessData = {
  userId: string;
  email: string;
};

export type TokenBundle = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  email: string;
};

export class RegistrationApiError extends Error {
  readonly status: number;
  readonly envelope: ApiEnvelope<null>;

  constructor(status: number, envelope: ApiEnvelope<null>) {
    super(envelope.error?.message ?? 'Registration failed');
    this.name = 'RegistrationApiError';
    this.status = status;
    this.envelope = envelope;
  }
}
