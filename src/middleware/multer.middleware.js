import multer from "multer";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { BadRequestException } from "../common/utils/errors/exception.error.js";
import { fileTypeFromFile } from "file-type";

export const allowedExtension = {
  image: ["image/jpeg", "image/png", "image/gif"],
  files: ["application/pdf", "application/json"],
};

export const multerUpload = ({ desiredPath = "general", validation = [] }) => {
  const fullDestination = `uploads/${desiredPath}`;
  if (!fs.existsSync(fullDestination)) {
    fs.mkdirSync(fullDestination, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, fullDestination);
    },
    filename: function (req, file, cb) {
      cb(null, randomUUID() + file.originalname);
    },
  });

  function fileFilter(req, file, cb) {
    if (validation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException("Invalid file extension", null, "MULTER_ERROR"),
        false,
      );
    }
  }

  return multer({ fileFilter, storage });
};

export const processFile = ({ validation = [] }) => {
  return async (req, res, next) => {
    const result = await fileTypeFromFile(req.file.path);

    if (!result || !validation.includes(result.mime)) {
      fs.unlinkSync(req.file.path);
      next(
        new BadRequestException("Invalid file format", null, "MULTER_ERROR"),
      );
      return;
    }

    next();
  };
};
