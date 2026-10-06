import { Router } from "express";
import * as authService from "./auth.service.js";
import * as validators from "./auth.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
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
    await authService.login({ email, password });
    return res.status(200).json({
      success: true,
      message: "User logged in successfully.",
    });
  },
);

export default authRouter;
