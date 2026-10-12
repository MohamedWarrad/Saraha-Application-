import { UnauthorizedException } from "../common/utils/errors/exception.error.js";

export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    const loggedInUserRole = req.user.role;

    if (!allowedRoles.includes(loggedInUserRole)) {
      throw new UnauthorizedException(
        "User is not authorized to access this resourse",
      );
    }
    next();
  };
};
