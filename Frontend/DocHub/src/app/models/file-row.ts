export interface FileRow {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'xls' | 'ppt' | 'image';
  size: number;
  uploadedAt: Date;
}
