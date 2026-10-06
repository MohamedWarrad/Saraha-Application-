import { z } from "zod";
import { genders } from "../../DB/models/user.model.js";

// login schema
export const loginSchema = z.strictObject({
  email: z.email({ error: "Provide valid email format" }),
  //   password: z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
  password: z.string().min(6).max(16),
});

export const login = z.object({
  body: loginSchema,
  query: z.strictObject({
    lang: z.enum(["ar", "en"]).default("ar"),
  }),
});

// register schema
export const registerSchema = loginSchema
  .extend({
    firstName: z.string().min(3).max(30),
    lastName: z.string().min(3).max(30),
    gender: z.enum(Object.values(genders)).default(genders.male),
    age: z.number().min(18, { error: "Age must be at least 18" }).max(90),
    phone: z.string().regex(/^(002|\+2)01[0125][0-9]{8}$/, {
      error: "Provide a valid EG number",
    }),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      return data.password == data.confirmPassword;
    },
    {
      message: "Password and confirmPassword mismatch",
      path: ["confirmPassword"],
    },
  );

// register
export const register = z.object({
  body: registerSchema,
});
