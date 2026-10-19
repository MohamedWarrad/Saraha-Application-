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
  userRevokeTokenKey,
} from "../../common/utils/security/token.security.js";
import { providersEnum } from "../../common/utils/constants.js";
import { randomBytes, randomUUID } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { set } from "../../common/services/cache.service.js";

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

const createTokenCredentials = (user) => {
  const tokensPayload = { _id: user._id, role: user.role };
  const jwtid = randomUUID();
  // generate access token
  const accessToken = generateToken(
    tokensPayload,
    userEnvConfig.access_token_secret,
    { expiresIn: userEnvConfig.access_token_expires_in, jwtid },
  );
  // generate refresh token
  const refreshToken = generateToken(
    tokensPayload,
    userEnvConfig.refresh_token_secret,
    { expiresIn: userEnvConfig.refresh_token_expires_in, jwtid },
  );
  return { accessToken, refreshToken };
};

export const login = async ({ email, password }) => {
  // const user = await userRepo.findUserByEmail(email);
  const user = await userRepo.findOneDocument({
    email,
    provider: providersEnum.SYSTEM,
  });
  if (!user) throw new BadRequestException("Invalid email or password");

  const isPasswordMatched = await compareHash(user.password, password);

  if (!isPasswordMatched)
    throw new BadRequestException("Invalid email or password");

  return createTokenCredentials(user);
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

const verifyIdToken = async (token) => {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: envConfig.GCP.client_id,
  });
  const payload = ticket.getPayload();
  return payload;
};

const updateOrCreate = async (user, googleTokenPayload) => {
  const { sub, email, given_name, family_name } = googleTokenPayload;
  if (user) {
    return userRepo.findByIdAndUpdate(
      user._id,
      { email, firstName: given_name, lastName: family_name },
      { new: true },
    );
  } else {
    const hasedPassword = await hash(randomBytes(12).toString("hex"));
    return userRepo.createDocument({
      googleSub: sub,
      provider: providersEnum.GOOGLE,
      email,
      firstName: given_name,
      lastName: family_name,
      password: hasedPassword,
    });
  }
};

const getVerifiedGoogleUser = async (idToken) => {
  const googleTokenPayload = await verifyIdToken(idToken);
  if (!googleTokenPayload || !googleTokenPayload.email_verified)
    throw new BadRequestException(
      "Not verified user email",
      null,
      "GOOGLE_EMAIL_NOT_VERIFIED",
    );

  const user = await userRepo.findOneDocument({
    googleSub: googleTokenPayload.sub,
    provider: providersEnum.GOOGLE,
  });
  return { user, googleTokenPayload };
};

// signup with google
export const googleRegister = async (idToken) => {
  const { user, googleTokenPayload } = await getVerifiedGoogleUser(idToken);

  const handledUser = await updateOrCreate(user, googleTokenPayload);

  return createTokenCredentials(handledUser);
};

// login with google
export const googleLogin = async (idToken) => {
  const { user } = await getVerifiedGoogleUser(idToken);

  if (!user)
    throw new BadRequestException("Invalid User", null, "USER_NOT_FOUND");

  return createTokenCredentials(user);
};

// logout
export const logout = async (payload, user) => {
  const now = Math.floor(Date.now() / 1000);
  const refreshExpiresAt =
    payload.iat + envConfig.jwt.user.refresh_token_expires_in;
  const ttl = refreshExpiresAt - now;

  if (ttl <= 0) return;

  await set({
    key: userRevokeTokenKey({ userId: user._id.toString(), jti: payload.jti }),
    value: payload.jti,
    ttl,
  });

  // console.log({ now, refreshExpiresAt, ttl });
};
