import { BadRequestException } from "../utils/errors/exception.error.js";

export const validation = (schema) => {
  return (req, res, next) => {
    const validationResult = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!validationResult.success)
      throw new BadRequestException(
        "Validation error",
        validationResult.error.issues,
      );

    req.validate = validationResult.data;

    next();
  };
};
