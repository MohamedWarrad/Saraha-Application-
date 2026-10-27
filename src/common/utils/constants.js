export const genderEnum = {
  MALE: "male",
  FEMALE: "female",
};

export const roleEnum = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

export const tokenTypeEnum = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
};

export const providersEnum = {
  SYSTEM: "system",
  GOOGLE: "google",
};

export const EmailSubjectEnum = {
  CONFIRM_EMAIL: "Confirm_Email",
  FORGOT_PASSWORD: "Forgot_Password",
  LOGIN_2FA: "Login_2FA",
  ENABLE_TWO_STEP_VERIFICATION: "Enable_Two_Step_Verification",
};

export const UserLoginAttemptsKey = ({ userId }) => {
  return `login:${userId}:failed-attempts`;
};

export const UserLoginBlockedKey = ({ userId }) => {
  return `login:${userId}:blocked`;
};
