import { CollectionModel } from "../models/collection";
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

export const collection:CollectionModel =   {
    id: '3',
    name: 'College',
    description: 'Notes & PDFs',
    icon: '🎓',
    file_ids:["1"],
    created_at:"BCE"
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

export const DefaultFile: FileRow = {
  id: '',
  name: '',
  description: '',
  file_type: FileType.OTHER,
  file_size: 0,
  thumbnail_link: '',
  uploaded_at: new Date(),
  favourite: false,
  tags: []
};

export const dummyFiles: FileRow[] = [
  {
    id: '1',
    name: 'Project_Report.pdf',
    description: 'Final year project report',
    file_type: FileType.DOCUMENT,
    file_size: 2_450_000,
    thumbnail_link: '/thumbnails/sample-pdf.jpg',
    uploaded_at: new Date('2025-01-02T10:30:00'),
    favourite: true,
    tags: ['college', 'project', 'pdf']
  },
  {
    id: '2',
    name: 'Design_Mockup.png',
    description: 'Homepage UI design mockup',
    file_type: FileType.IMAGE,
    file_size: 1_120_000,
    thumbnail_link: '/thumbnails/sample-image.jpg',
    uploaded_at: new Date('2025-01-05T14:15:00'),
    favourite: false,
    tags: ['ui', 'design', 'figma']
  },
  {
    id: '3',
    name: 'Presentation.pptx',
    description: 'Startup pitch deck',
    file_type: FileType.DOCUMENT,
    file_size: 3_800_000,
    thumbnail_link: '',
    uploaded_at: new Date('2025-01-08T09:00:00'),
    favourite: false,
    tags: ['pitch', 'startup']
  },
  {
    id: '4',
    name: 'Intro_Video.mp4',
    description: 'Product intro video',
    file_type: FileType.VIDEO,
    file_size: 48_500_000,
    thumbnail_link: '',
    uploaded_at: new Date('2025-01-10T18:45:00'),
    favourite: true,
    tags: ['video', 'marketing']
  },
  {
    id: '5',
    name: 'Backend_Code.zip',
    description: 'Spring Boot backend source code',
    file_type: FileType.ARCHIVE,
    file_size: 12_300_000,
    thumbnail_link: '',
    uploaded_at: new Date('2025-01-11T12:20:00'),
    favourite: false,
    tags: ['backend', 'spring', 'zip']
  },
  {
    id: '6',
    name: 'AuthService.java',
    description: 'JWT authentication service',
    file_type: FileType.CODE,
    file_size: 18_400,
    thumbnail_link: '',
    uploaded_at: new Date('2025-01-12T16:10:00'),
    favourite: true,
    tags: ['java', 'security']
  },
  {
    id: '7',
    name: 'Podcast_Episode.mp3',
    description: 'Tech podcast episode',
    file_type: FileType.AUDIO,
    file_size: 9_750_000,
    thumbnail_link: '',
    uploaded_at: new Date('2025-01-13T20:00:00'),
    favourite: false,
    tags: ['audio', 'podcast']
  }
];

