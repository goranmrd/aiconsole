import { MaterialContentType } from '@/types/types';



export function getMaterialContentName(contentType?: MaterialContentType) {
  switch (contentType) {
    case 'static_text':
      return 'Note';
    case 'dynamic_text':
      return 'Dynamic Note';
    case 'api':
      return 'Python API';
    default:
      return 'Material';
  }
}
