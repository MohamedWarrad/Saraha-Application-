class HttpAppError extends Error {
  message;
  statusCode;
  data;
  code;
  constructor(message, statusCode = 400, data = {}, code = "Bad Request!") {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.code = code;
  }
}

export default HttpAppError;
