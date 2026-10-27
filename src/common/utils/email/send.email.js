import nodemailer from "nodemailer";
import envConfig from "../../../config/env.config.js";

export const UserEmailKey = ({ email, subject }) => {
  return `email_verification:${email}::${subject}:OTP`;
};
export const UserEmailTrialsKey = ({ email, subject }) => {
  return `${UserEmailKey({ email, subject })}:Trials`;
};

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: envConfig.email.APP_EMAIL,
    pass: envConfig.email.APP_PASSWORD,
  },
});

export const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  text,
  html,
  attachments = [],
}) => {
  try {
    if (!to?.length && !bcc?.length && !cc?.length) {
      throw BadRequestException("Missing email recipients");
    }
    if (!text?.length && !html?.length && !attachments?.length) {
      throw BadRequestException("Missing email content");
    }

    const info = await transporter.sendMail({
      from: `Saraha_App <${envConfig.email.APP_EMAIL}>`,
      to, // list of recipients
      cc,
      bcc,
      subject,
      text,
      html,
      attachments,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
};

/*

import nodemailer from "nodemailer";
import {
  APP_EMAIL,
  APP_PASSWORD,
  APPLICATION_NAME,
} from "../../../config/env.config.js";
import { BadRequestException } from "../../exceptions/error.exception.js";

export const UserEmailKey = ({ email, subject }) => {
  return `User::${email}::${subject}::OTP`;
};
export const UserEmailTrialsKey = ({ email, subject }) => {
  return `${UserEmailKey({ email, subject })}::Trials`;
};

// Create a transporter using service
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: APP_EMAIL,
    pass: APP_PASSWORD,
  },
});

export const sendEmail = async ({
  to, // list of recipients
  cc,
  bcc,
  subject, // subject line
  text, // plain text body
  html, // HTML body
  attachments = [],
}) => {
  try {
    if (!to?.length && !bcc?.length && !cc?.length) {
      throw BadRequestException("Missing email recipients");
    }
    if (!text?.length && !html?.length && !attachments?.length) {
      throw BadRequestException("Missing email content");
    }

    const info = await transporter.sendMail({
      from: `${APPLICATION_NAME} <${APP_EMAIL}>`, // sender address
      to, // list of recipients
      cc,
      bcc,
      subject, // subject line
      text, // plain text body
      html, // HTML body
      attachments,
    });

    console.log("Message sent: %s", info.messageId);
    // Preview URL is only available when using an Ethereal test account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
};


*/
