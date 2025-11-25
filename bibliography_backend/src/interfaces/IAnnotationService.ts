import { IAnnotation } from '../models/Annotation';

export interface CreateAnnotationInput {
  type: 'highlight' | 'note';
  pageIndex: number;
  position: {
    rects: Array<[number, number, number, number]>;
  };
  content: {
    text?: string;
    comment?: string;
  };
  color: string;
  sortIndex?: string;
}

export interface UpdateAnnotationInput {
  content?: {
    text?: string;
    comment?: string;
  };
  color?: string;
}

export interface IAnnotationService {
  create(userId: string, referenceId: string, data: CreateAnnotationInput): Promise<IAnnotation>;
  getById(id: string, userId: string): Promise<IAnnotation | null>;
  listByReference(referenceId: string, userId: string): Promise<IAnnotation[]>;
  update(id: string, userId: string, data: UpdateAnnotationInput): Promise<IAnnotation | null>;
  delete(id: string, userId: string): Promise<boolean>;
  deleteByReference(referenceId: string, userId: string): Promise<number>;
}
