import dotenv from "dotenv";

// `.${process.env.NODE_ENV}.env` ---> .dev.env
dotenv.config({ path: [`.${process.env.NODE_ENV}.env`, `.env`] });

const envConfig = {
  database: {
    uri: process.env.DB_URI_LOCAL ?? "mongodb://localhost/test_db",
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY,
    iV: parseInt(process.env.IV_LENGTH),
  },
  jwt: {
    user: {
      access_token_secret: process.env.USER_ACCESS_TOKEN_SECRET,
      access_token_expires_in: process.env.USER_ACCESS_TOKEN_EXPIRES_IN,

      refresh_token_secret: process.env.USER_REFRESH_TOKEN_SECRET,
      refresh_token_expires_in: Number(
        process.env.USER_REFRESH_TOKEN_EXPIRES_IN,
      ),
    },
    admin: {
      access_token_secret: process.env.ADMIN_ACCESS_TOKEN_SECRET,
      access_token_expires_in: process.env.ADMIN_ACCESS_TOKEN_EXPIRES_IN,

      refresh_token_secret: process.env.ADMIN_REFRESH_TOKEN_SECRET,
      refresh_token_expires_in: Number(
        process.env.ADMIN_REFRESH_TOKEN_EXPIRES_IN,
      ),
    },
  },
  GCP: {
    client_id: process.env.GCP_CLIENT_ID,
  },
  redis: {
    url: process.env.REDIS_CLOUD_URI,
  },
  email: {
    APP_EMAIL: process.env.APP_EMAIL,
    APP_PASSWORD: process.env.APP_PASSWORD,
  },
  social_media: {
    FACEBOOK: process.env.FACEBOOK,
    INSTAGRAM: process.env.INSTAGRAM,
    TWITTER: process.env.TWITTER,
  },
};

export default envConfig;
