import { Router } from "express";
import * as authService from "./auth.service.js";
const authRouter = Router();

// signup
authRouter.post("/register", async (req, res, next) => {
  await authService.register(req.body);
  return res
    .status(201)
    .json({ success: true, message: "User registered successfully." });
});

// login
authRouter.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  await authService.login({ email, password });
  return res.status(200).json({
    success: true,
    message: "User logged in successfully.",
  });
});

export default authRouter;
