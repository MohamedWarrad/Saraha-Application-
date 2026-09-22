import crypto from "node:crypto";
import envConfig from "../../config/env.config.js";

const ENCRYPTION_KEY = Buffer.from(envConfig.encryption.key, "hex");
const IV_LENGTH = envConfig.encryption.iV;

export const encrypt = (plainText) => {
  // Generate random iv bytes
  const iv = crypto.randomBytes(IV_LENGTH);
  //   console.log({ iv });

  const cipherObject = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

  let cipherText = cipherObject.update(plainText, "utf-8", "hex");

  cipherText += cipherObject.final("hex");

  return `${iv.toString("hex")}:${cipherText}`;
};

// 1bccf3cbc10a4453197219e8d79174e8:8ed4624746359376994541210836779e
export const decrypt = (cipher) => {
  const [iv, encryptedText] = cipher.split(":");
  const bufferedIv = Buffer.from(iv, "hex");
  const decipherObject = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY,
    bufferedIv,
  );

  let decipherText = decipherObject.update(encryptedText, "hex", "utf-8");

  decipherText += decipherObject.final("utf-8");

  return decipherText;
};
