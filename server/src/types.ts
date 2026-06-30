export interface Env {
  DATA_BUCKET: R2Bucket;
  ASSETS_BUCKET: R2Bucket;

  AUTH_STORE: KVNamespace;
  ADMIN_PASSWORD_HASH: string;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  CONTACT_EMAIL: string;
  NODE_ENV: string;
  RATE_LIMITER_DO: DurableObjectNamespace;
}
