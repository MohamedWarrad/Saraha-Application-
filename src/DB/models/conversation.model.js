import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IdentityRequest",
      required: true,
      unique: true,
    },

    originalMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
      required: true,
      unique: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  },
);

const ConversationModel =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export default ConversationModel;
