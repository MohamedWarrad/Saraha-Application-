import envConfig from "../../config/env.config.js";
import UserRepository from "../../DB/repositories/user.repository.js";
import {
  BadRequestException,
  ConflictException,
} from "../../common/utils/errors/exception.error.js";
import { encrypt } from "../../common/utils/security/encryption.security.js";
import {
  compareHash,
  hash,
} from "../../common/utils/security/hash.security.js";
import {
  generateToken,
  getRoleJwtConfig,
} from "../../common/utils/security/token.security.js";

const userRepo = new UserRepository();

// const {user: userEnvConfig, admin: adminEnvConfig} = envConfig.jwt.user
const userEnvConfig = envConfig.jwt.user;

export const register = async (body) => {
  const { firstName, lastName, email, password, gender, age, phoneNumber } =
    body;
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
  if (phoneNumber) encryptedPhone = encrypt(phoneNumber);
  // console.log(encryptedPhone);

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
  const user = await userRepo.findUserByEmail(email);
  if (!user) throw new BadRequestException("Invalid email or password");

  const isPasswordMatched = await compareHash(user.password, password);

  if (!isPasswordMatched)
    throw new BadRequestException("Invalid email or password");

  // generate access token
  const accessToken = generateToken(
    { _id: user._id, role: user.role },
    userEnvConfig.access_token_secret,
    { expiresIn: userEnvConfig.access_token_expires_in },
  );
  // generate refresh token
  const refreshToken = generateToken(
    { _id: user._id, role: user.role },
    userEnvConfig.refresh_token_secret,
    { expiresIn: userEnvConfig.refresh_token_expires_in },
  );
  return { accessToken, refreshToken };
};

export const rotateToken = async (user) => {
  const roleEnvConfig = getRoleJwtConfig(user.role);

  const accessToken = generateToken(
    { _id: user._id, role: user.role },
    roleEnvConfig.access_token_secret,
    { expiresIn: roleEnvConfig.access_token_expires_in },
  );
  return { accessToken };
};

// export const rotateToken = async (payload, user) => {
//   const accessTokenExpiresAt =
//     payload.iat + userEnvConfig.access_token_expires_in;
//   const currentTime = Math.floor(Date.now() / 1000);
//   const refreshWindow = 5 * 60 * 60;

//   if (currentTime < accessTokenExpiresAt - refreshWindow) {
//     throw new ConflictException(
//       "Access token is still valid for more than 5 minutes",
//     );
//   }

//   console.log({
//     payload,
//     user,
//     accessTokenExpiresAt,
//     currentTime,
//     refreshWindow,
//   });

//   const accessToken = generateToken(
//     { _id: user._id, role: user.role },
//     userEnvConfig.access_token_secret,
//     { expiresIn: userEnvConfig.access_token_expires_in },
//   );

//   return accessToken;
// };
