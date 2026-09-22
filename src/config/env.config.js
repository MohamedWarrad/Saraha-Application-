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
};

export default envConfig;
