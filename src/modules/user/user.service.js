import { isValidObjectId } from "mongoose";
import User from "../../DB/models/user.model.js";
import { decrypt } from "../../utils/security/encryption.security.js";
import UserRepository from "../../DB/repositories/user.repository.js";

const userRepo = new UserRepository();

export const profile = async (id) => {
  const user = await userRepo.findDocumentById(id).select("-password");

  if (user.phoneNumber) user.phoneNumber = decrypt(user.phoneNumber);

  return user;
};
