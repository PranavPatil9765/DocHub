import { CollectionModel } from "../models/collection.model";
import { FileRow, FileType } from "../models/file.model";

export const collections: any[] = [
  {
    id: '1',
    name: 'Design Docs',
    description: 'UI related files',
    icon: '📄',
    state: 'normal'
  },
  {
    id: '2',
    name: 'Backend',
    description: 'APIs & DB schemas',
    icon: '🧩',
    state: 'normal'
  },
  {
    id: '3',
    name: 'College',
    description: 'Notes & PDFs',
    icon: '🎓',
    state: 'normal'
  }
];

export const Defaultcollection:CollectionModel =   {
    id: '3',
    name: 'College',
    description: 'Notes & PDFs',
    icon: '🎓',
    file_ids:["1"],
    created_at:"BCE",
    state:'default'
  }

export const DefaultCollections:any[]=[
    {
      id:1,
      state:"default",
      name:"Images",
      imageUrl:"assets/image.png",
    },
    {
      id:2,
      state:"default",
      name:"Documents",
      imageUrl:"assets/pdf.png",
    },
    {
      id:3,
      state:"default",
      name:"Favourites",
      imageUrl:"assets/like.png",
    }
]

export const DefaultFile: FileRow = {
  id: '',
  name: '',
  description: '',
  type: FileType.OTHER,
  size: 0,
  preview_url: '',
  uploadedAt: new Date(),
  favourite: false,
  tags: []
};

export const dummyFiles: FileRow[] = [

];

export const  sortOptions = [
    { label: 'Name (A → Z)', value: { sortBy: 'NAME', sortDir: 'ASC' } },
    { label: 'Name (Z → A)', value: { sortBy: 'NAME', sortDir: 'DESC' } },

    { label: 'Size (Small → Large)', value: { sortBy: 'SIZE', sortDir: 'ASC' } },
    { label: 'Size (Large → Small)', value: { sortBy: 'SIZE', sortDir: 'DESC' } },

    { label: 'Upload Date (Newest)', value: { sortBy: 'UPLOADED_AT', sortDir: 'DESC' } },
    { label: 'Upload Date (Oldest)', value: { sortBy: 'UPLOADED_AT', sortDir: 'ASC' } },
  ];

