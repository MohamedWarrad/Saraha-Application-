import BaseRepository from "./base.repository.js";
import User from "../models/user.model.js";

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  ////// only in UserRepo class

  findUserByEmail(email) {
    return this.findOneDocument({ email });
  }
}

export default UserRepository;
