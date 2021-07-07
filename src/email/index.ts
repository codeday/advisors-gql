import handlebars from 'handlebars';
import fs from 'fs';
import { Advisor, Request } from '@prisma/client';
import { Container } from 'typedi';
import nodemailer from 'nodemailer';
import { RequestType } from '../enums';

const FROM = '"CodeDay" <volunteer@codeday.org>';
const TEMPLATES = {
  onboard: handlebars.compile(fs.readFileSync(`${__dirname}/templates/onboard.html`).toString()),
  changeLimits: handlebars.compile(fs.readFileSync(`${__dirname}/templates/changeLimits.html`).toString()),
  introInterview: handlebars.compile(fs.readFileSync(`${__dirname}/templates/introInterview.html`).toString()),
  introResume: handlebars.compile(fs.readFileSync(`${__dirname}/templates/introResume.html`).toString()),
  requestSubmitted: handlebars.compile(fs.readFileSync(`${__dirname}/templates/requestSubmitted.html`).toString()),
};

export async function sendOnboard(advisor: Advisor): Promise<void> {
  const mailTransport = Container.get<nodemailer.Transporter>('email');
  await mailTransport.sendMail({
    to: advisor.email,
    from: FROM,
    subject: 'Career Advising Confirmed',
    html: TEMPLATES.onboard({ advisor }),
  });
}

export async function sendChangeLimits(advisor: Advisor): Promise<void> {
  const mailTransport = Container.get<nodemailer.Transporter>('email');
  await mailTransport.sendMail({
    to: advisor.email,
    from: FROM,
    subject: 'Career Advising Update',
    html: TEMPLATES.changeLimits({ advisor }),
  });
}

export async function sendRequestSubmitted(request: Request): Promise<void> {
  const mailTransport = Container.get<nodemailer.Transporter>('email');
  await mailTransport.sendMail({
    to: request.email,
    from: FROM,
    subject: 'Confirmed Submission',
    html: TEMPLATES.requestSubmitted({ }),
  });
}

export async function sendIntro(advisor: Advisor, request: Request): Promise<void> {
  const mailTransport = Container.get<nodemailer.Transporter>('email');
  const subjectPrefix = request.type === RequestType.INTERVIEW ? 'Practice Interview' : 'Resume Feedback';
  const template = request.type === RequestType.INTERVIEW ? TEMPLATES.introInterview : TEMPLATES.introResume;
  await mailTransport.sendMail({
    to: [advisor.email, request.email],
    from: FROM,
    subject: `${subjectPrefix}: ${advisor.givenName} <> ${request.givenName}`,
    html: template({ advisor, request }),
  });
}
