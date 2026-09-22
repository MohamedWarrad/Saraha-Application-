import { Router } from "express";
import * as userService from "./user.service.js";
const userRouter = Router();

userRouter.get("/profile/:id", async (req, res, next) => {
  const result = await userService.profile(req.params.id);
  return res.status(200).json({ success: true, data: result });
});

export default userRouter;
