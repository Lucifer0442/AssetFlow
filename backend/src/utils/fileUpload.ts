import env from '../config/env';

export function getFileUrl(filename: string): string {
  // Return the public URL for uploaded files
  return `/uploads/${filename}`;
}

export function extractFilenameFromUrl(url: string): string | null {
  const parts = url.split('/uploads/');
  if (parts.length > 1) {
    return parts[1];
  }
  return null;
}
