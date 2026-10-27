import { EventEmitter } from "node:events";
import { verifyEmailTemplate } from "./email.templates.js";
import { sendEmail } from "./send.email.js";

export const emailEvent = new EventEmitter();

emailEvent.on("sendEmail", async ({ recipients, subject, data }) => {
  try {
    await sendEmail({
      ...recipients,
      subject,
      html: verifyEmailTemplate({
        code: data.code,
        subject,
        title: data.title ?? subject,
      }),
    });
  } catch (error) {
    console.log(error);
  }
});

// recipients = { to, cc, bcc }
