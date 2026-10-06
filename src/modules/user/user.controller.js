import { Router } from "express";
import * as userService from "./user.service.js";
const userRouter = Router();

// profile
userRouter.get("/profile/:id", async (req, res, next) => {
  const result = await userService.profile(req.params.id);
  return res.status(200).json({ success: true, data: result });
});

// get users
userRouter.get("/", async (req, res, next) => {
  const data = await userService.getAllUsers();
  return res
    .status(200)
    .json({ success: true, message: "All users feched successfully", data });
});

// update profile
userRouter.patch("/update/:userId", async (req, res, next) => {
  const data = await userService.updateProfile(req.body, req.params.userId);
  return res
    .status(200)
    .json({ success: true, message: "Document updated successfully", data });
});

// delete profile
userRouter.delete("/delete/:userId", async (req, res, next) => {
  const data = await userService.deleteProfile(req.params.userId);
  return res
    .status(200)
    .json({ success: true, message: "Document deleted successfully", data });
});

export default userRouter;
