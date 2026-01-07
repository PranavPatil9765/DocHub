export interface CollectionModel {
  id: string;
  name: string;
  icon:string;
  description?: string;
  state:'normal'|'default';
}
