import { z } from "zod";
import { BadRequestException } from "../../common/utils/errors/exception.error.js";
import mongoose from "mongoose";

export const sendMessage = z.object({
  body: z.object({
    receiverId: z
      .string()
      .refine((data) => mongoose.Types.ObjectId.isValid(data), {
        message: "Invalid receiverId",
      }),

    content: z.preprocess(
      (value) =>
        typeof value === "string" && !value.trim() ? undefined : value,
      z.string().trim().min(2).max(10000).optional(),
    ),
  }),
});

export const validateMessageContent = (req, res, next) => {
  if (!req.body.content && !req.file) {
    return next(
      new BadRequestException("Message content or attachment is required"),
    );
  }

  next();
};

export const sendConversationMessage = z.object({
  body: z.object({
    content: z.string().trim().min(1).max(10000),
  }),
});
