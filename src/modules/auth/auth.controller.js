import { Router } from "express";
import * as authService from "./auth.service.js";
import * as validators from "./auth.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { authenticate } from "../../middleware/authentication.middleware.js";
import { tokenTypeEnum } from "../../common/utils/constants.js";
const authRouter = Router();

// signup
authRouter.post(
  "/register",
  validation(validators.register),
  async (req, res, next) => {
    await authService.register(req.validate.body);
    return res
      .status(201)
      .json({ success: true, message: "User registered successfully." });
  },
);

// login
authRouter.post(
  "/login",
  validation(validators.login),
  async (req, res, next) => {
    const { email, password } = req.validate.body;
    const data = await authService.login({ email, password });
    return res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      data,
    });
  },
);

//rotate token
authRouter.post(
  "/rotate-token",
  authenticate(tokenTypeEnum.REFRESH_TOKEN),
  async (req, res, next) => {
    const data = await authService.rotateToken(req.user);
    return res.status(200).json({
      success: true,
      message: "rotate-token",
      data,
    });
  },
);

export default authRouter;
