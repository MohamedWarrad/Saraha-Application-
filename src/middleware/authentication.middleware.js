import UserRepository from "../DB/repositories/user.repository.js";
import { BadRequestException } from "../common/utils/errors/exception.error.js";
import { decodeToken } from "../common/utils/security/token.security.js";
import { tokenTypeEnum } from "../common/utils/constants.js";

const userRepo = new UserRepository();

export const authenticate = (tokenType = tokenTypeEnum.ACCESS_TOKEN) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new BadRequestException("Authorization header is missing");
    }

    const [prefix, token] = authorization.split(" ");
    if (prefix !== "Bearer" || !token) {
      throw new BadRequestException("invalid authorization header format");
    }

    const user = await decodeToken({
      token,
      tokenType,
    });

    req.user = user;
    // req.payload = decodedData;
    next();
  };
};
