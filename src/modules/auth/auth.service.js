import envConfig from "../../config/env.config.js";
import UserRepository from "../../DB/repositories/user.repository.js";
import {
  BadRequestException,
  ConflictException,
  TooManyRequestException,
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
import {
  EmailSubjectEnum,
  providersEnum,
  UserLoginAttemptsKey,
  UserLoginBlockedKey,
} from "../../common/utils/constants.js";
import { randomBytes, randomUUID } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import {
  del,
  expire,
  get,
  incrBy,
  keys,
  set,
  ttl,
} from "../../common/services/cache.service.js";
import {
  sendEmail,
  UserEmailKey,
  UserEmailTrialsKey,
} from "../../common/utils/email/send.email.js";
import { createOtpNumber } from "../../common/utils/otp.js";
import { emailEvent } from "../../common/utils/email/email.event.js";

const userRepo = new UserRepository();

// const {user: userEnvConfig, admin: adminEnvConfig} = envConfig.jwt.user
const userEnvConfig = envConfig.jwt.user;

const sendEmailOtp = async ({ email, subject }) => {
  const existOTP_TTL = await ttl({ key: UserEmailKey({ email, subject }) });

  if (existOTP_TTL > 0) {
    throw new ConflictException(
      `Sorry we cannot create new OTP while existing one stil valid please try again later after ${existOTP_TTL}s`,
    );
  }

  const oldTrails =
    (await get({ key: UserEmailTrialsKey({ email, subject }) })) ?? 0;
  if (oldTrails >= 3) {
    throw new TooManyRequestException("Max OTP trials has been reached");
  }

  const code = createOtpNumber();
  await set({
    key: UserEmailKey({ email, subject }),
    value: await hash(code.toString()),
    ttl: 120,
  });

  const currentTrials = await incrBy({
    key: UserEmailTrialsKey({ email, subject }),
  });
  if (currentTrials == 3) {
    await expire({
      key: UserEmailTrialsKey({ email, subject }),
      ttl: 300,
    });
  }

  // send email
  emailEvent.emit("sendEmail", {
    recipients: { to: email },
    subject,
    data: { code },
  });
};

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

  // send email
  await sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL });

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

const checkLoginBlock = async (userId) => {
  const blockedKey = UserLoginBlockedKey({ userId });

  const isBlocked = await get({
    key: blockedKey,
  });

  if (isBlocked) {
    const remainingSeconds = await ttl({
      key: blockedKey,
    });

    throw new TooManyRequestException(
      `Too many failed login attempts. Try again in ${remainingSeconds} seconds`,
    );
  }
};

const verifyLoginPassword = async ({ user, password }) => {
  const attemptsKey = UserLoginAttemptsKey({
    userId: user._id,
  });

  const blockedKey = UserLoginBlockedKey({
    userId: user._id,
  });

  const isPasswordMatched = await compareHash(user.password, password);

  if (!isPasswordMatched) {
    const currentAttempts = await incrBy({
      key: attemptsKey,
    });

    if (currentAttempts >= 5) {
      await set({
        key: blockedKey,
        value: "1",
        ttl: 300,
      });

      await del({
        key: [attemptsKey],
      });

      throw new TooManyRequestException(
        "Too many failed login attempts. Try again after 5 minutes",
      );
    }

    throw new BadRequestException("Invalid email or password");
  }

  await del({
    key: [attemptsKey],
  });
};

export const login = async ({ email, password }) => {
  const user = await userRepo.findOneDocument({
    email,
    provider: providersEnum.SYSTEM,
    confirmEmail: { $exists: true },
  });

  if (!user) {
    throw new BadRequestException("Invalid email or password");
  }

  await checkLoginBlock(user._id);

  await verifyLoginPassword({
    user,
    password,
  });

  if (user.twoStepVerification) {
    await sendEmailOtp({
      email,
      subject: EmailSubjectEnum.LOGIN_2FA,
    });

    return {
      requiresTwoStepVerification: true,
    };
  }

  return createTokenCredentials(user);
};

// export const login = async ({ email, password }) => {
//   const user = await userRepo.findOneDocument({
//     email,
//     provider: providersEnum.SYSTEM,
//     confirmEmail: { $exists: true },
//   });

//   if (!user) {
//     throw new BadRequestException("Invalid email or password");
//   }

//   const attemptsKey = UserLoginAttemptsKey({
//     userId: user._id,
//   });

//   const blockedKey = UserLoginBlockedKey({
//     userId: user._id,
//   });

//   const isBlocked = await get({
//     key: blockedKey,
//   });

//   if (isBlocked) {
//     const remainingSeconds = await ttl({
//       key: blockedKey,
//     });

//     throw new TooManyRequestException(
//       `Too many failed login attempts try again in ${remainingSeconds} s`,
//     );
//   }

//   const isPasswordMatched = await compareHash(user.password, password);

//   if (!isPasswordMatched) {
//     const currentAttempts = await incrBy({
//       key: attemptsKey,
//     });

//     if (currentAttempts >= 5) {
//       await set({
//         key: blockedKey,
//         value: "1",
//         ttl: 300,
//       });

//       await del({ key: [attemptsKey] });

//       throw new TooManyRequestException(
//         "Too many failed login attempts try again after 5 minutes",
//       );
//     }

//     throw new BadRequestException("Invalid email or password");
//   }

//   await del({
//     key: [attemptsKey],
//   });

//   if (user.twoStepVerification) {
//     await sendEmailOtp({
//       email,
//       subject: EmailSubjectEnum.LOGIN_2FA,
//     });

//     return {
//       requiresTwoStepVerification: true,
//     };
//   }

//   return createTokenCredentials(user);
// };

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

// confirm email
export const confirmEmail = async ({ email, otp }) => {
  const user = await userRepo.findOneDocument({
    email,
    provider: providersEnum.SYSTEM,
    confirmEmail: { $exists: false },
  });
  if (!user) throw new BadRequestException("Invalid email or password");

  const hashOTP = await get({
    key: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }),
  });
  if (!hashOTP || !(await compareHash(hashOTP, otp))) {
    throw new BadRequestException("Invalid OTP");
  }

  user.confirmEmail = new Date();
  await user.save();

  await del({
    key: await keys({
      prefix: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }),
    }),
  });
  return;
};

// resendConfirm Email
export const resendConfirmEmail = async ({ email }) => {
  const user = await userRepo.findOneDocument({
    email,
    provider: providersEnum.SYSTEM,
    confirmEmail: { $exists: false },
  });
  if (!user) throw new BadRequestException("Invalid email or password");

  await sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL });
  return;
};

// requestForgotPasswordCode
export const requestForgotPasswordCode = async ({ email }) => {
  const user = await userRepo.findOneDocument({
    email,
    provider: providersEnum.SYSTEM,
    confirmEmail: { $exists: true },
  });
  if (!user) throw new BadRequestException("Invalid email or password");

  await sendEmailOtp({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD });
  return;
};

// verifyForgotPasswordCode
export const verifyForgotPasswordCode = async ({ email, otp }) => {
  const user = await userRepo.findOneDocument({
    email,
    provider: providersEnum.SYSTEM,
    confirmEmail: { $exists: true },
  });
  if (!user) throw new BadRequestException("Invalid email or password");

  const hashOTP = await get({
    key: UserEmailKey({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD }),
  });
  if (!hashOTP || !(await compareHash(hashOTP, otp))) {
    throw new BadRequestException("Invalid OTP");
  }

  return user;
};

// resetForgotPassword
export const resetForgotPassword = async ({ email, otp, password }) => {
  const account = await verifyForgotPasswordCode({ email, otp });
  account.password = await hash(password);
  account.changeCredentialsTime = new Date();
  await account.save();

  await del({
    key: await keys({
      prefix: UserEmailKey({
        email,
        subject: EmailSubjectEnum.FORGOT_PASSWORD,
      }),
    }),
  });

  return;
};

// confitm login
export const confirmLogin = async ({ email, otp }) => {
  const user = await userRepo.findOneDocument({
    email,
    provider: providersEnum.SYSTEM,
    confirmEmail: { $exists: true },
  });
  if (!user) throw new BadRequestException("Invalid email or password");

  if (!user.twoStepVerification) {
    throw new BadRequestException("Two-step verification is not enabled");
  }

  const hashOTP = await get({
    key: UserEmailKey({ email, subject: EmailSubjectEnum.LOGIN_2FA }),
  });
  if (!hashOTP || !(await compareHash(hashOTP, otp))) {
    throw new BadRequestException("Invalid OTP");
  }

  await del({
    key: await keys({
      prefix: UserEmailKey({
        email,
        subject: EmailSubjectEnum.LOGIN_2FA,
      }),
    }),
  });

  return createTokenCredentials(user);
};

// enableTwoStepVerification
export const enableTwoStepVerification = async ({ email }) => {
  const user = await userRepo.findOneDocument({
    email,
    provider: providersEnum.SYSTEM,
    confirmEmail: { $exists: true },
  });
  if (!user) throw new BadRequestException("Invalid email or password");

  if (user.twoStepVerification) {
    throw new ConflictException("Two-step verification is already enabled");
  }

  await sendEmailOtp({
    email,
    subject: EmailSubjectEnum.ENABLE_TWO_STEP_VERIFICATION,
  });
  return { message: "OTP sent successfully" };
};

// verifyTwoStepVerification
export const verifyTwoStepVerification = async ({ email }, { otp }) => {
  const user = await userRepo.findOneDocument({
    email,
    provider: providersEnum.SYSTEM,
    confirmEmail: { $exists: true },
  });
  if (!user) throw new BadRequestException("Invalid email or password");

  if (user.twoStepVerification) {
    throw new ConflictException("Two-step verification is already enabled");
  }

  const hashOTP = await get({
    key: UserEmailKey({
      email,
      subject: EmailSubjectEnum.ENABLE_TWO_STEP_VERIFICATION,
    }),
  });
  if (!hashOTP || !(await compareHash(hashOTP, otp))) {
    throw new BadRequestException("Invalid OTP");
  }

  user.twoStepVerification = true;
  await user.save();

  await del({
    key: await keys({
      prefix: UserEmailKey({
        email,
        subject: EmailSubjectEnum.ENABLE_TWO_STEP_VERIFICATION,
      }),
    }),
  });

  return true;
};
