/* eslint-disable sonarjs/no-duplicate-string */
import {
  Profile, Recommendation, EventParticipation, RecommendationRating,
} from '@prisma/client';
import path from 'path';
import PDFDocument from 'pdfkit';
import { DateTime } from 'luxon';
import config from '../config';
import { streamToBuffer } from './streamToBuffer';
import { ageDescription } from './ageDescription';
import { seekingDescription } from './seekingDescription';
import { recRatingDescription } from './recRatingDescription';

export type MetadataPdfProfileInformation = Profile
  & { recommendations: Recommendation[], eventParticipation: EventParticipation[] };

function drawHeader(doc: PDFKit.PDFDocument, profile: MetadataPdfProfileInformation): void {
  doc
    .image(
      path.join(config.resourcesDir, 'logo.png'),
      50,
      50,
      {
        height: 24,
        valign: 'center',
      },
    )
    .fontSize(24)
    .font('Helvetica-Bold')
    .text(`${profile.givenName} ${profile.familyName}`, 50, 50, { align: 'right' })
    .font('Helvetica')
    .fontSize(12);

  [profile.urlGithub, profile.urlLinkedIn]
    .filter(Boolean)
    .forEach((url) => {
      doc
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .text(url!, { link: url!, underline: true, align: 'right' });
    });

  doc
    .moveDown(0.5)
    .font('Helvetica-Bold')
    .text(ageDescription(profile) || 'Alum', 50, doc.y, { align: 'right' });

  const seeking = seekingDescription(profile);
  if (seeking) doc.text(`Seeking: ${seeking}`, 50, doc.y, { align: 'right' });

  doc.font('Helvetica').moveDown(2);
}

function drawRecommendation(doc: PDFKit.PDFDocument, rec: Recommendation): void {
  const dateStr = DateTime.fromJSDate(rec.updatedAt).toLocaleString({ month: 'short', year: 'numeric' });
  doc
    .font('Helvetica-Bold')
    .text(
      `${dateStr} / ${rec.givenName} ${rec.familyName}, ${rec.title} @ ${rec.employer}`,
      50,
      doc.y,
      { underline: true },
    )
    .font('Helvetica')
    .moveDown();

  if (rec.recommendation) doc.text(rec.recommendation).moveDown();

  [
    ['Self-Directed', rec.skillEngineering],
    ['Technical', rec.skillTechnical],
    ['Interpersonal', rec.skillInterpersonal],
  ].forEach(([label, rating], i) => doc
    .text(i % 2 === 1 ? ' '.repeat(5) : '', i % 2 === 0 ? 50 : doc.x, doc.y, { lineBreak: false })
    .font('Helvetica-Bold')
    .text(`${label}: `, { lineBreak: false })
    .font('Helvetica')
    .text(recRatingDescription(rating as RecommendationRating), { lineBreak: i % 2 === 1 }));

  doc.moveDown();
}

export function makeMetadataPdf(profile: MetadataPdfProfileInformation): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
  const buf = streamToBuffer(doc);
  setImmediate(() => {
    drawHeader(doc, profile);
    if (profile.recommendations.length > 0) {
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('Recommendations', 50, doc.y)
        .font('Helvetica')
        .fontSize(12)
        .moveDown();
      profile.recommendations.forEach((rec) => drawRecommendation(doc, rec));
    }
    doc.end();
  });
  return buf;
}
