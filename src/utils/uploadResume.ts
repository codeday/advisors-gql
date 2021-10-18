import Uploader from '@codeday/uploader-node';
import { Container } from 'typedi';
import { FileUpload } from 'graphql-upload';
import { convertNonPdf } from './convertNonPdf';
import { uploadToBuffer } from './uploadToBuffer';

export async function uploadResume(file?: Promise<FileUpload> | FileUpload): Promise<string | undefined> {
  if (!file) return undefined;
  const resume = await file;
  if (!resume) return undefined;

  const ext = resume?.filename?.split('.').pop() || 'pdf';
  if (ext && !['pdf', 'doc', 'docx'].includes(ext)) {
    throw new Error('Only PDF and DOC/DOCX files are supported.');
  }

  if (ext !== 'pdf') {
    const pdf = await convertNonPdf(`_.${ext}`, await uploadToBuffer(resume));
    const { url } = await (<Uploader>Container.get(Uploader))
      .file(pdf, `_.pdf`);
    return url;
  }

  const { url } = await (<Uploader>Container.get(Uploader))
    .file(await uploadToBuffer(resume), `_.pdf`);
  return url;
}
