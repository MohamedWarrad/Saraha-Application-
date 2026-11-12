import BaseRepository from "./base.repository.js";
import RequestModel from "../models/request.model.js";

class RequestRepository extends BaseRepository {
  constructor() {
    super(RequestModel);
  }
}

export default RequestRepository;
