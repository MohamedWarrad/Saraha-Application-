import BaseRepository from "./base.repository.js";
import ChatMessageModel from "../models/chat-message.model.js";

class ChatMessageRepository extends BaseRepository {
  constructor() {
    super(ChatMessageModel);
  }
}

export default ChatMessageRepository;
