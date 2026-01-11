import { CollectionModel } from "../models/collection";
import { FileRow } from "../models/file-row";

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

export const collection:CollectionModel =   {
    id: '3',
    name: 'College',
    description: 'Notes & PDFs',
    icon: '🎓',
    state: 'normal'
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
      name:"Pdfs",
      imageUrl:"assets/pdf.png",
    },
    {
      id:3,
      state:"default",
      name:"Favourites",
      imageUrl:"assets/like.png",
    }
]

export const DefaultFile:FileRow = {
  id: "1",
  name: "temp",
  url: "xxx.yyy",
  description:"temp",
  tags:["dw"],
  type: 'pdf',
  size: 100,
  uploadedAt: new Date,
  isFavourite:false
  }

  export const dummyFiles: FileRow[] = [
  {
    id: 'f1',
    name: 'UI Design Guidelines',
    url: 'assets/files/ui-design-guidelines.pdf',
    description: 'Design system and UI standards for the project',
    type: 'pdf',
    size: 245760, // 240 KB
    uploadedAt: new Date('2024-11-12T10:30:00'),
    isFavourite: true,
    tags: ['design', 'ui', 'guidelines']
  },
  {
    id: 'f2',
    name: 'Backend API Spec',
    url: 'assets/files/backend-api-spec.docx',
    description: 'Complete API documentation for backend services',
    type: 'doc',
    size: 524288, // 512 KB
    uploadedAt: new Date('2024-12-01T14:15:00'),
    isFavourite: false,
    tags: ['backend', 'api', 'documentation']
  },
  {
    id: 'f3',
    name: 'Sales Report Q3',
    url: 'assets/files/sales-report-q3.xlsx',
    description: 'Quarter 3 sales and revenue analysis',
    type: 'xls',
    size: 1048576, // 1 MB
    uploadedAt: new Date('2024-10-20T09:00:00'),
    isFavourite: false,
    tags: ['sales', 'report', 'excel']
  },
  {
    id: 'f4',
    name: 'Project Presentation',
    url: 'assets/files/project-presentation.pptx',
    description: 'Final project presentation for stakeholders',
    type: 'ppt',
    size: 3145728, // 3 MB
    uploadedAt: new Date('2024-12-18T16:45:00'),
    isFavourite: true,
    tags: ['presentation', 'project', 'slides']
  },
  {
    id: 'f5',
    name: 'Homepage Banner',
    url: 'assets/files/homepage-banner.png',
    description: 'Hero banner image used on homepage',
    type: 'image',
    size: 786432, // 768 KB
    uploadedAt: new Date('2025-01-05T11:20:00'),
    isFavourite: false,
    tags: ['image', 'banner', 'homepage']
  }
];
