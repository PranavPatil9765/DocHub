export interface FileRow {
  id: string;
  file?: File;
  name: string;
  description: string;
  tags: string[];
  type:FileType;
  favourite:boolean;
  stage?: UploadStage;
  progress?: number;
  preview_url:string;
  isRetrying?:boolean;
  size:number;
  isExisting?: boolean;
  uploadedAt?:Date;
  originalExt?: string;
}
export enum FileType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  ARCHIVE = 'ARCHIVE',
  CODE = 'CODE',
  OTHER = 'OTHER',
}
export const FILE_TYPE_COLOR: Record<FileType, string> = {
  [FileType.IMAGE]: 'text-emerald-500',
  [FileType.VIDEO]: 'text-purple-500',
  [FileType.AUDIO]: 'text-pink-500',
  [FileType.DOCUMENT]: 'text-blue-500',
  [FileType.ARCHIVE]: 'text-orange-500',
  [FileType.CODE]: 'text-yellow-500',
  [FileType.OTHER]: 'text-gray-400',
};
export const FILE_TYPE_ICON: Record<FileType, string> = {
  [FileType.IMAGE]: 'fa-regular fa-image',
  [FileType.VIDEO]: 'fa-solid fa-film',
  [FileType.AUDIO]: 'fa-solid fa-music',
  [FileType.DOCUMENT]: 'fa-regular fa-file-lines',
  [FileType.ARCHIVE]: 'fa-solid fa-file-zipper',
  [FileType.CODE]: 'fa-solid fa-code',
  [FileType.OTHER]: 'fa-regular fa-file',
};
export const FILE_TYPE_BG: Record<FileType, string> = {
  IMAGE: 'bg-emerald-50',
  VIDEO: 'bg-purple-50',
  AUDIO: 'bg-pink-50',
  DOCUMENT: 'bg-blue-50',
  ARCHIVE: 'bg-orange-50',
  CODE: 'bg-yellow-50',
  OTHER: 'bg-gray-50',
};
export interface SearchSuggestion {
  id: string;
  name: string;
  file_type?: FileType;
  icon?:string
}
export type UploadStage =
  | 'initiated'
  | 'queued'
  | 'uploaded'
  | 'failed'
  | 'tagging'
  | 'ready';

export interface FileUpdateRequest{
  id: string;
  name: string;
  description:string,
  tags:string[]
}
