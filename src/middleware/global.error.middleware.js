export const globalErrorHandling = (error, req, res, next) => {
  // const status = error.cause?.status || 500;
  const status = error.statusCode || 500;

  return res.status(status).json({
    success: false,
    message: error.message || "Something went wrong",
    errorBody: error.data,
    code: error.code,
    stack: error.stack,
  });
};
