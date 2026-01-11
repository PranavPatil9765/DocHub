export interface FileRow {
  id: string;
  name: string;
  url: string;
  description:string,
  type: 'pdf' | 'doc' | 'xls' | 'ppt' | 'image';
  size: number;
  uploadedAt: Date;
  isFavourite:boolean,
  tags:string[]
}
