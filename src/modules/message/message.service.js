import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "../../common/utils/errors/exception.error.js";
import MessageRepository from "../../DB/repositories/message.repository.js";
import RequestRepository from "../../DB/repositories/request.repository.js";
import UserRepository from "../../DB/repositories/user.repository.js";
import ConversationRepository from "../../DB/repositories/conversation.repository.js";
import ChatMessageRepository from "../../DB/repositories/chat-message.repository.js";

const userRepo = new UserRepository();
const messageRepo = new MessageRepository();
const requestRepo = new RequestRepository();
const conversationRepo = new ConversationRepository();
const chatMessageRepo = new ChatMessageRepository();

// send message
export const sendMessage = async ({ content, receiverId, senderId }, file) => {
  const checkReceiverExist = await userRepo.findDocumentById(receiverId);
  if (!checkReceiverExist) {
    throw new BadRequestException("Invalid id");
  }

  if (senderId.toString() === receiverId.toString()) {
    throw new BadRequestException("You cannot send a message to yourself");
  }

  const message = await messageRepo.createDocument({
    content,
    receiverId,
    senderId,
    attachment: file ? [file.path] : [],
  });

  const messageData = message.toObject();
  delete messageData.senderId;

  return messageData;
};

export const requestIdentityService = async (messageId, userId) => {
  const message = await messageRepo.findDocumentById(messageId);

  if (!message) {
    throw new BadRequestException("Message not found");
  }

  if (message.receiverId.toString() !== userId.toString()) {
    throw new ForbiddenException("You are not authorized");
  }

  const newRequest = await requestRepo.createDocument({
    messageId: message._id,
    receiverId: userId,
    senderId: message.senderId,
    status: "pending",
  });

  return {
    requestId: newRequest._id,
    messageId: newRequest.messageId,
    status: newRequest.status,
    createdAt: newRequest.createdAt,
  };
};

//identity-requests

export const getIdentityRequests = async (userId) => {
  const reqIdentity = await requestRepo.findAllDocuments({
    senderId: userId,
  });
  return reqIdentity;
};

export const updateRequestStatusService = async (requestId, userId, status) => {
  const request = await requestRepo.findDocumentById(requestId);

  if (!request) {
    throw new BadRequestException("Request not found");
  }

  if (request.senderId.toString() !== userId.toString()) {
    throw new UnauthorizedException(
      "You are not authorized to update this request",
    );
  }

  if (request.status !== "pending") {
    throw new BadRequestException(`Request is already ${request.status}`);
  }

  request.status = status;
  await request.save();

  return request;
};

export const createConversationService = async (requestId, userId) => {
  const request = await requestRepo.findDocumentById(requestId);

  if (!request) {
    throw new BadRequestException("request not found");
  }

  if (request.status !== "accepted") {
    throw new BadRequestException("Identity request must be accepted");
  }

  const isParticipant =
    request.senderId.toString() === userId.toString() ||
    request.receiverId.toString() === userId.toString();

  if (!isParticipant) {
    throw new UnauthorizedException("You are not authorized");
  }

  const existingConversation = await conversationRepo.findOneDocument({
    originalMessageId: request.messageId,
  });

  if (existingConversation) {
    return existingConversation;
  }

  const conversation = await conversationRepo.createDocument({
    requestId: request._id,
    originalMessageId: request.messageId,
    senderId: request.senderId,
    receiverId: request.receiverId,
  });

  return conversation;
};

export const sendConversationMessageService = async ({
  conversationId,
  userId,
  content,
}) => {
  const conversation = await conversationRepo.findDocumentById(conversationId);

  if (!conversation) {
    throw new BadRequestException("Conversation not found");
  }

  const isParticipant =
    conversation.senderId.toString() === userId.toString() ||
    conversation.receiverId.toString() === userId.toString();

  if (!isParticipant) {
    throw new UnauthorizedException(
      "You are not authorized to send messages in this conversation",
    );
  }

  const chatMessage = await chatMessageRepo.createDocument({
    content,
    conversationId: conversation._id,
    senderId: userId,
  });

  return chatMessage;
};

export const getConversationMessagesService = async (
  conversationId,
  userId,
) => {
  const conversation = await conversationRepo.findDocumentById(conversationId);

  if (!conversation) {
    throw new BadRequestException("Conversation not found");
  }

  const isParticipant =
    conversation.senderId.toString() === userId.toString() ||
    conversation.receiverId.toString() === userId.toString();

  if (!isParticipant) {
    throw new UnauthorizedException(
      "You are not authorized to access this conversation",
    );
  }
  const messages = await chatMessageRepo.findAllDocuments({
    conversationId: conversation._id,
  });

  messages.sort((a, b) => a.createdAt - b.createdAt);

  return messages;
};
