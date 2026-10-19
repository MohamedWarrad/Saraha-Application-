import jwt from "jsonwebtoken";
import {
  BadRequestException,
  UnauthorizedException,
} from "../errors/exception.error.js";
import envConfig from "../../../config/env.config.js";
import UserRepository from "../../../DB/repositories/user.repository.js";
import { tokenTypeEnum } from "../constants.js";
import { exist } from "../../services/cache.service.js";

const jwtConfig = envConfig.jwt;

const userRepo = new UserRepository();

export const userRevokeTokenKey = ({ userId, jti }) => {
  return `Saraha::User::${userId}::Revoke_Token::${jti}`;
};

export const generateToken = (payload = {}, secret = "", option = {}) => {
  return jwt.sign(payload, secret, option);
};

export const verifyToken = (token = {}, secret = "") => {
  return jwt.verify(token, secret);
};

export const getRoleJwtConfig = (role) => {
  const roleJwtConfig = jwtConfig[role]; // user , admin

  if (!roleJwtConfig) {
    throw new BadRequestException("Invalid role in token");
  }

  return roleJwtConfig;
};

const getTokenSecret = (tokenType, data) => {
  let signature;
  switch (tokenType) {
    case tokenTypeEnum.ACCESS_TOKEN:
      signature = getRoleJwtConfig(data.role).access_token_secret;
      break;

    case tokenTypeEnum.REFRESH_TOKEN:
      signature = getRoleJwtConfig(data.role).refresh_token_secret;
      break;

    default:
      throw new BadRequestException("Invalide token type");
  }
  return signature;
};

export const decodeToken = async ({ token, tokenType }) => {
  const data = jwt.decode(token);

  if (!data?.role) {
    throw new BadRequestException("Role not found in token");
  }

  const signature = getTokenSecret(tokenType, data);

  const decodedData = verifyToken(token, signature);

  const user = await userRepo
    .findDocumentById(decodedData._id)
    .select("-password");

  if (!user) {
    throw new BadRequestException("User not found");
  }

  if (
    await exist({
      key: userRevokeTokenKey({
        userId: user._id.toString(),
        jti: decodedData.jti,
      }),
    })
  ) {
    throw new UnauthorizedException("Expired login credentials");
  }

  return { user, decodedData };
};
