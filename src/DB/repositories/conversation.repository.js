import BaseRepository from "./base.repository.js";
import ConversationModel from "../models/conversation.model.js";

class ConversationRepository extends BaseRepository {
  constructor() {
    super(ConversationModel);
  }
}

export default ConversationRepository;
