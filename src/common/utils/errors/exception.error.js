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

export class TooManyRequestException extends HttpAppError {
  constructor(
    message = "Too Many Request Exception",
    data = {},
    code = "Too_Many_Request",
  ) {
    super(message, 409, data, code);
  }
}

export class NotFoundException extends HttpAppError {
  constructor(message = "Not found", data = {}, code = "NOT_FOUND") {
    super(message, 404, data, code);
  }
}

export class UnauthorizedException extends HttpAppError {
  constructor(message = "Unauthorized", data = {}, code = "UNAUTHORIZED") {
    super(message, 401, data, code);
  }
}
