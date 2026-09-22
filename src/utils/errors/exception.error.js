import HttpAppError from "./app.error.js";

export class BadRequestException extends HttpAppError {
  constructor(message = "bad request", data = {}, code = "Bad_Request") {
    super(message, 400, data, code);
  }
}

export class ConflictException extends HttpAppError {
  constructor(message = "conflict", data = {}, code = "CONFLICT") {
    super(message, 409, data, code);
  }
}
