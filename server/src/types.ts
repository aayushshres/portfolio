export interface Env {
  DATA_BUCKET: R2Bucket;
  ASSETS_BUCKET: R2Bucket;
  ADMIN_PASSWORD_HASH: string;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  CONTACT_EMAIL: string;
  NODE_ENV: string;
}
