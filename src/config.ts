/* eslint-disable @typescript-eslint/no-non-null-assertion, node/no-process-env */
import { config as loadEnv } from 'dotenv';
import SMTPConnection from 'nodemailer/lib/smtp-connection';
import { DurationInput } from 'luxon';
import { PrismaClient } from '@prisma/client';

loadEnv();
const requestTimeout: DurationInput = { months: 3 };

const config = {
  port: Number.parseInt(process.env.PORT || '5000', 10) || 5000,
  debug: process.env.NODE_ENV !== 'production',
  requestTimeout,
  uploader: {
    base: process.env.UPLOADER_BASE!,
    secret: process.env.UPLOADER_SECRET,
  },
  email: <SMTPConnection.Options & { from: string }>{
    host: process.env.EMAIL_HOST!,
    port: Number.parseInt(process.env.EMAIL_PORT!, 10),
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
    from: process.env.EMAIL_FROM!,
  },
  auth: {
    secret: process.env.AUTH_SECRET!,
    audience: process.env.AUTH_AUDIENCE!,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
    phone: process.env.TWILIO_PHONE!,
  },
  prisma: new PrismaClient(),
};

export default config;
