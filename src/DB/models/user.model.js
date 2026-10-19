import { model, Schema } from "mongoose";
import {
  genderEnum,
  providersEnum,
  roleEnum,
} from "../../common/utils/constants.js";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [3, "First Name must be at least 3 characters long"],
      maxLength: [30, "First Name must be at most 30 characters long"],
      lowercase: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minLength: [3, "Last Name must be at least 3 characters long"],
      maxLength: [30, "Last Name must be at most 30 characters long"],
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      index: { name: "idx_email_unique", unique: true },
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: Object.values(genderEnum),
      default: genderEnum.MALE,
    },
    age: {
      type: Number,
      min: [18, "Age must be at least 18"],
      max: [90, "Age must be at most 90"],
    },
    role: {
      type: String,
      enum: Object.values(roleEnum),
      default: roleEnum.USER,
    },
    profilePicture: String,
    phoneNumber: String,
    googleSub: {
      type: String,
      index: {
        name: "idx_google_sub_unique",
        unique: true,
      },
    },
    provider: {
      type: String,
      enum: Object.values(providersEnum),
      default: providersEnum.SYSTEM,
    },
  },
  {
    timestamps: true,
    virtuals: {
      fullName: {
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
      },
    },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

// userSchema.virtual('fullName').get(function(){
//     return `${this.firstName} ${this.lastName}`;
// })

const User = model("User", userSchema);

export default User;
