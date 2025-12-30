export function getExtension(file: string): string {
  return file.split('.').pop()?.toLowerCase() || '';
}
