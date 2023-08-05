import { str, cleanEnv } from 'envalid';

const env = cleanEnv(process.env, {
  PORT: str(),
  DATABASE_URI: str(),
  ACCESS_TOKEN_SECRET: str(),
  REFRESH_TOKEN_SECRET: str(),
});

export default env;
