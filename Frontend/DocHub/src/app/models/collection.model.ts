export interface CollectionModel {
  id: string;
  name: string;
  icon:string;
  description?: string;
  file_ids:string[];
  created_at:string;
  imageUrl?:string;
  state:'default'|'normal';
}
