import { FileRow, FileType } from "../app/models/file.model";

export function getExtension(file: string): string {
  return file.split('.').pop()?.toLowerCase() || '';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${sizes[i]}`;
}
// src/app/utils/file-type.util.ts

export function getFileType(filename?: string | null): FileType {

  if (!filename || !filename.trim()) {
    return FileType.OTHER;
  }

  // 1️⃣ Extract extension safely
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) {
    return FileType.OTHER;
  }

  const extension = filename.substring(lastDot + 1).toLowerCase();

  switch (extension) {

    /* ---------- IMAGES ---------- */
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'bmp':
    case 'svg':
      return FileType.IMAGE;

    /* ---------- VIDEOS ---------- */
    case 'mp4':
    case 'mkv':
    case 'avi':
    case 'mov':
    case 'webm':
    case 'flv':
      return FileType.VIDEO;

    /* ---------- AUDIO ---------- */
    case 'mp3':
    case 'wav':
    case 'aac':
    case 'flac':
    case 'ogg':
      return FileType.AUDIO;

    /* ---------- DOCUMENTS ---------- */
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'xls':
    case 'xlsx':
    case 'ppt':
    case 'pptx':
    case 'txt':
    case 'csv':
      return FileType.DOCUMENT

    /* ---------- ARCHIVES ---------- */
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return FileType.ARCHIVE;

    /* ---------- CODE ---------- */
    case 'java':
    case 'js':
    case 'ts':
    case 'py':
    case 'cpp':
    case 'c':
    case 'html':
    case 'css':
    case 'json':
    case 'xml':
    case 'yaml':
    case 'yml':
      return FileType.CODE

    default:
      return FileType.OTHER
  }
}

export function mapStatusToStage(status?: string): FileRow['stage'] {

  const normalized = status?.trim().toUpperCase();
  console.log(normalized);

  switch (normalized) {
    case 'QUEUED':
      return 'queued';
    case 'UPLOADED':
      return 'uploaded';
    case 'TAG_GENERATION':
      return 'tagging';
    case 'READY':
      return 'ready';
    case 'FAILED':
      return 'failed';
    default:
      return 'initiated';
  }
}
