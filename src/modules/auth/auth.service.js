import UserRepository from "../../DB/repositories/user.repository.js";
import HttpAppError from "../../utils/errors/app.error.js";
import {
  BadRequestException,
  ConflictException,
} from "../../utils/errors/exception.error.js";
import { encrypt } from "../../utils/security/encryption.security.js";
import { compareHash, hash } from "../../utils/security/hash.security.js";

const userRepo = new UserRepository();

export const register = async (body) => {
  const { firstName, lastName, email, password, gender, age, phone } = body;
  // check user existence
  const checkEmail = await userRepo.findUserByEmail(email);
  if (checkEmail)
    throw new ConflictException(
      "Email already exist",
      {
        duplicatedEmail: email,
      },
      "EMAIL_CONFLICT",
    );
  // throw new Error("user already exist", { cause: { status: 409 } });

  // encrypty phone
  let encryptedPhone;
  if (phone) encryptedPhone = encrypt(phone);
  console.log(encryptedPhone);

  const hashedPassword = await hash(password);

  // create user
  return userRepo.createDocument({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    gender,
    age,
    phoneNumber: encryptedPhone || undefined,
  });
};

export const login = async ({ email, password }) => {
  const user = await userRepo.findUserByEmail(email).lean();
  if (!user) throw new BadRequestException("Invalid email or password");

  const isPasswordMatched = await compareHash(user.password, password);

  if (!isPasswordMatched)
    throw new BadRequestException("Invalid email or password");
};
