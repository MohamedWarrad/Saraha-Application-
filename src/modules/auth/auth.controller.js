import { Router } from "express";
import * as authService from "./auth.service.js";
import * as validators from "./auth.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { authenticate } from "../../middleware/authentication.middleware.js";
import { tokenTypeEnum } from "../../common/utils/constants.js";
import { BadRequestException } from "../../common/utils/errors/exception.error.js";
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
      message: data.requiresTwoStepVerification
        ? "OTP sent successfully"
        : "User logged in successfully.",
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

// signup with gmail
authRouter.post("/google-register", async (req, res, next) => {
  const { idToken } = req.body;
  if (!idToken)
    throw new BadRequestException(
      "Google ID token is required",
      null,
      "MISSING_GOOGLE_ID_TOKEN",
    );
  const data = await authService.googleRegister(idToken);
  return res.status(201).json({
    success: true,
    message: "User registered successfully.",
    data,
  });
});

// login with gmail
authRouter.post("/google-login", async (req, res, next) => {
  const { idToken } = req.body;
  if (!idToken)
    throw new BadRequestException(
      "Google ID token is required",
      null,
      "MISSING_GOOGLE_ID_TOKEN",
    );
  const data = await authService.googleLogin(idToken);
  return res.status(200).json({
    success: true,
    message: "User logged in successfully.",
    data,
  });
});

// logout
authRouter.post("/logout", authenticate(), async (req, res, next) => {
  const data = await authService.logout(req.payload, req.user);
  return res.status(200).json({
    success: true,
    message: "LoggedOut Successfully",
    data,
  });
});

// Confirm Email
authRouter.patch(
  "/confirm-email",
  validation(validators.confirmEmail),
  async (req, res) => {
    const data = await authService.confirmEmail(req.body);
    return res.status(200).json({
      success: true,
      message: "Confirmed Successfully",
      data,
    });
  },
);

// resend Confirm Email
authRouter.patch(
  "/resend-confirm-email",
  validation(validators.resendConfirmEmail),
  async (req, res) => {
    const data = await authService.resendConfirmEmail(req.body);
    return res.status(200).json({
      success: true,
      message: "OTP send Successfully",
      data,
    });
  },
);

// request forgot password code
authRouter.post(
  "/request-forgot-password-code",
  validation(validators.resendConfirmEmail),
  async (req, res) => {
    const data = await authService.requestForgotPasswordCode(req.body);
    return res.status(200).json({
      success: true,
      data,
    });
  },
);

// verify Forgot Password Code
authRouter.post(
  "/verify-forgot-password",
  validation(validators.confirmEmail),
  async (req, res) => {
    const data = await authService.verifyForgotPasswordCode(req.body);
    return res.status(200).json({
      success: true,
      data,
    });
  },
);

// reset Forgot Password Code
authRouter.patch(
  "/reset-forgot-password",
  validation(validators.resetForgotPassword),
  async (req, res) => {
    const data = await authService.resetForgotPassword(req.body);
    return res.status(200).json({
      success: true,
      message: "Password Updated Successfully",
      data,
    });
  },
);

// confirm login
authRouter.post(
  "/confirm-login",
  validation(validators.confirmEmail),
  async (req, res) => {
    const data = await authService.confirmLogin(req.body);
    return res.status(200).json({
      success: true,
      data,
    });
  },
);

// enableTwoStepVerification
authRouter.post(
  "/enable-two-step-verification",
  authenticate(),
  async (req, res) => {
    const data = await authService.enableTwoStepVerification(req.user);
    return res.status(200).json({
      success: true,
      data,
    });
  },
);

// verifyTwoStepVerification
authRouter.patch(
  "/verify-two-step-verification",
  authenticate(),
  validation(validators.verifyTwoStepVerification),
  async (req, res) => {
    const data = await authService.verifyTwoStepVerification(
      req.user,
      req.body,
    );
    return res.status(200).json({
      success: true,
      data,
    });
  },
);

export default authRouter;
