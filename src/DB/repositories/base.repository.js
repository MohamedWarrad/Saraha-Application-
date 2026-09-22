import { isValidObjectId } from "mongoose";

class BaseRepository {
  model;
  constructor(model) {
    this.model = model;
  }

  createDocument(data) {
    return this.model.create(data);
  }

  findDocumentById(_id) {
    if (!isValidObjectId(_id))
      throw new Error("Invalid ObjectId", { cause: { status: 400 } });

    return this.model.findById(_id);
  }

  findOneDocument(filters = {}) {
    return this.model.findOne(filters);
  }

  findOneAndUpdateDocument(filters, updates, options) {
    return this.model.findOneAndUpdate(filters, updates, options);
  }
}

export default BaseRepository;
