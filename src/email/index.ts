import handlebars from 'handlebars';
import fs from 'fs';
import { Advisor, Request, RequestAssignment } from '@prisma/client';
import { Container } from 'typedi';
import nodemailer from 'nodemailer';
import { RequestType } from '../enums';
import { makeAdvisorToken } from '../utils';

const FROM = '"CodeDay" <volunteer@codeday.org>';
const TEMPLATES = {
  onboard: handlebars.compile(fs.readFileSync(`${__dirname}/templates/onboard.html`).toString()),
  changeLimits: handlebars.compile(fs.readFileSync(`${__dirname}/templates/changeLimits.html`).toString()),
  introInterview: handlebars.compile(fs.readFileSync(`${__dirname}/templates/introInterview.html`).toString()),
  introResume: handlebars.compile(fs.readFileSync(`${__dirname}/templates/introResume.html`).toString()),
  mentorInterview: handlebars.compile(fs.readFileSync(`${__dirname}/templates/mentorInterview.html`).toString()),
  mentorResume: handlebars.compile(fs.readFileSync(`${__dirname}/templates/mentorResume.html`).toString()),
  studentResume: handlebars.compile(fs.readFileSync(`${__dirname}/templates/mentorResume.html`).toString()),
  requestSubmitted: handlebars.compile(fs.readFileSync(`${__dirname}/templates/requestSubmitted.html`).toString()),
  requestResponseSubmitted: handlebars.compile(fs.readFileSync(`${__dirname}/templates/requestResponseSubmitted.html`).toString()),
};

function makeFeedbackUrl(request: Request, advisor: Advisor) {
  return `https://jobs.codeday.org/respond/${makeAdvisorToken(advisor.id)}/${request.id}`;
}

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

export async function sendRequestResponseSubmitted(assignment: RequestAssignment & { request: Request, advisor: Advisor }): Promise<void> {
  const mailTransport = Container.get<nodemailer.Transporter>('email');
  await mailTransport.sendMail({
    to: assignment.request.email,
    from: FROM,
    subject: (assignment.request.type === 'INTERVIEW' ? 'Practice interview' : 'Resume') + `feedback from ${assignment.advisor.givenName} ${assignment.advisor.familyName}`,
    html: TEMPLATES.requestResponseSubmitted({ assignment }),
  });

  // Send an intro email for discussing resume feedback
  if (assignment.request.type === RequestType.RESUME) {
    await mailTransport.sendMail({
      to: [assignment.advisor.email, assignment.request.email],
      from: FROM,
      subject: `Resume Feedback: ${assignment.advisor.givenName} <> ${assignment.request.givenName}`,
      html: TEMPLATES.introInterview({ advisor: assignment.advisor, request: assignment.request }),
    });
  }
}


export async function sendIntro(advisor: Advisor, request: Request): Promise<void> {
  const mailTransport = Container.get<nodemailer.Transporter>('email');

  // Practice interview: send intro email + mentor feedback link
  if (request.type === RequestType.INTERVIEW) {
    await mailTransport.sendMail({
      to: [advisor.email, request.email],
      from: FROM,
      subject: `Practice Interview: ${advisor.givenName} <> ${request.givenName}`,
      html: TEMPLATES.introInterview({ advisor, request }),
    });
    await mailTransport.sendMail({
      to: [advisor.email, request.email],
      from: FROM,
      subject: `[Action Required] Submit feedback on your practice interview with ${request.givenName}`,
      html: TEMPLATES.mentorInterview({ advisor, request, feedbackUrl: makeFeedbackUrl(request, advisor) }),
    });

  // Resume feedback: send individual emails to student + mentor
  } else if (request.type === RequestType.RESUME) {
    await mailTransport.sendMail({
      to: advisor.email,
      from: FROM,
      subject: `[Action Required] Resume feedback for ${request.givenName} ${request.familyName}`,
      html: TEMPLATES.mentorResume({ advisor, request, feedbackUrl: makeFeedbackUrl(request, advisor) }),
    });
    await mailTransport.sendMail({
      to: request.email,
      from: FROM,
      subject: `Resume feedback assigned to ${advisor.givenName} ${advisor.familyName}`,
      html: TEMPLATES.studentResume({ advisor, request }),
    });
  }
}
