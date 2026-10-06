import { isValidObjectId } from "mongoose";
import User from "../../DB/models/user.model.js";
import { decrypt } from "../../utils/security/encryption.security.js";
import UserRepository from "../../DB/repositories/user.repository.js";

const userRepo = new UserRepository();

// profile
export const profile = async (id) => {
  const user = await userRepo.findDocumentById(id).select("-password");

  if (user.phoneNumber) user.phoneNumber = decrypt(user.phoneNumber);

  return user;
};

// get all users
export const getAllUsers = async () => {
  return userRepo.findAllDocuments().select("-password");
};

// update profile
export const updateProfile = async (body, userId) => {
  const { firstName, lastName, email, gender, age } = body;
  return userRepo.findOneAndUpdateDocument(
    { _id: userId },
    { firstName, lastName, email, gender, age },
    { new: true, validators: true },
  );
};

// delete profile
export const deleteProfile = async (userId) => {
  return userRepo.findOneAndDeleteDocument({ _id: userId });
};
