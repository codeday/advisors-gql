import fetch from 'node-fetch';
import FormData from 'form-data';
import config from '../config';
import { streamToBuffer } from './streamToBuffer';

export async function convertNonPdf(filename: string, file: Buffer): Promise<Buffer> {
  const body = new FormData();
  body.append('files', file, { filename });
  const res = await fetch(`${config.gotenberg.base}/forms/libreoffice/convert`, { method: 'POST', body });
  return streamToBuffer(res.body);
}
