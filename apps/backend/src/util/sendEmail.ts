import nodemailer from "nodemailer";

interface IEmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: IEmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_EMAIL!,
      pass: process.env.SMTP_PASSWORD!,
    },
  });

  const message: nodemailer.SendMailOptions = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(message);
};
