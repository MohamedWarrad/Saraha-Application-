import { Router } from "express";
import * as messageService from "./message.service.js";
import * as validators from "./message.validation.js";
import { validation } from "../../middleware/validation.middleware.js";

import {
  allowedExtension,
  multerUpload,
  processFile,
} from "../../middleware/multer.middleware.js";
import { authenticate } from "../../middleware/authentication.middleware.js";
import { BadRequestException } from "../../common/utils/errors/exception.error.js";
const messageRouter = Router();

// send message
messageRouter.post(
  "/send",
  authenticate(),
  multerUpload({
    desiredPath: "messages",
    validation: allowedExtension.image,
  }).single("attachment"),
  processFile({ validation: allowedExtension.image }),
  validation(validators.sendMessage),
  validators.validateMessageContent,
  async (req, res, next) => {
    const { content, receiverId } = req.body;

    const data = await messageService.sendMessage(
      { content, receiverId, senderId: req.user._id },
      req.file,
    );
    return res.status(201).json({ message: "message send successfully", data });
  },
);

// POST /request-identity/:messageId
messageRouter.post(
  "/request-identity/:messageId",
  authenticate(),
  async (req, res, next) => {
    const { messageId } = req.params;
    const userId = req.user._id;

    const data = await messageService.requestIdentityService(messageId, userId);

    return res.status(201).json({
      message: "Identity request created successfully",
      data,
    });
  },
);

// get /request-identity
messageRouter.get(
  "/identity-requests",
  authenticate(),
  async (req, res, next) => {
    const userId = req.user._id;

    const data = await messageService.getIdentityRequests(userId);

    return res.status(200).json({
      message: "Identity request",
      data,
    });
  },
);

// PATCH /requests/:requestId/status
const validationStatus = ["accepted", "rejected"];
messageRouter.patch(
  "/requests/:requestId/status",
  authenticate(),
  async (req, res, next) => {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!validationStatus.includes(status)) {
      throw new BadRequestException("status Must be accepted or rejected");
    }

    const data = await messageService.updateRequestStatusService(
      requestId,
      userId,
      status,
    );

    return res.status(200).json({
      message: `status updated to ${status} successfully`,
      data,
    });
  },
);

messageRouter.post(
  "/conversations/:requestId",
  authenticate(),
  async (req, res, next) => {
    const { requestId } = req.params;
    const userId = req.user._id;

    const data = await messageService.createConversationService(
      requestId,
      userId,
    );

    return res.status(201).json({
      message: "Conversation created successfully",
      data,
    });
  },
);

messageRouter.post(
  "/conversations/:conversationId/messages",
  authenticate(),
  validation(validators.sendConversationMessage),
  async (req, res, next) => {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const data = await messageService.sendConversationMessageService({
      conversationId,
      userId,
      content,
    });

    return res.status(201).json({
      message: "Message sent successfully",
      data,
    });
  },
);

messageRouter.get(
  "/conversations/:conversationId/messages",
  authenticate(),
  async (req, res, next) => {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const data = await messageService.getConversationMessagesService(
      conversationId,
      userId,
    );

    return res.status(200).json({
      message: "Conversation messages retrieved successfully",
      data,
    });
  },
);

export default messageRouter;
