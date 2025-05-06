import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
  PORT,
  SERVER_URL,
  NODE_ENV,
  DB_URI,
  ARCJET_KEY,
  ARCJET_ENV,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  QSTASH_URL,
  QSTASH_TOKEN,
  QSTASH_CURRENT_SIGNING_KEY,
  EMAIL_PASSWORD,
  TRUST_PROXY
} = process.env;