export const FILE_TYPE_STYLES: Record<
  string,
  { bg: string; text: string; border: string; icon:string }
> = {
 pdf: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    icon: 'fa-file-pdf',        // 🔴 PDF
  },
  doc: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    icon: 'fa-file-word',       // 🔵 DOC
  },
  xls: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    icon: 'fa-file-excel',      // 🟢 XLS
  },
  ppt: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    icon: 'fa-file-powerpoint', // 🟠 PPT
  },
  image: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    icon: 'fa-file-image',      // 🟣 IMAGE
  },
  default: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
    icon: 'fa-file',
  },
};

export function getFileClasses(type: string) {
    return (
      FILE_TYPE_STYLES[type] || {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
      }
    );
  }
