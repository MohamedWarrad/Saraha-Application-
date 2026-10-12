import { Router } from "express";
import * as userService from "./user.service.js";
import { authenticate } from "../../middleware/authentication.middleware.js";
import { authorize } from "../../middleware/authorization.middleware.js";
import { roleEnum } from "../../common/utils/constants.js";
const userRouter = Router();

// profile
userRouter.get(
  "/profile",
  authenticate(),
  authorize(roleEnum.USER),
  async (req, res, next) => {
    const data = await userService.profile(req.user);
    return res.status(200).json({ success: true, data });
  },
);

// get users
userRouter.get(
  "/",
  authenticate(),
  authorize(roleEnum.ADMIN),
  async (req, res, next) => {
    const data = await userService.getAllUsers();
    return res
      .status(200)
      .json({ success: true, message: "All users feched successfully", data });
  },
);

// update profile
userRouter.patch("/update", authenticate(), async (req, res, next) => {
  const data = await userService.updateProfile(req.body, req.user._id);
  return res
    .status(200)
    .json({ success: true, message: "Document updated successfully", data });
});

// delete profile
userRouter.delete("/delete", authenticate(), async (req, res, next) => {
  const data = await userService.deleteProfile(req.user._id);
  return res
    .status(200)
    .json({ success: true, message: "Document deleted successfully", data });
});

export default userRouter;
