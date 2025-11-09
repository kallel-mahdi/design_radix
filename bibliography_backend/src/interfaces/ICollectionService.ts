import { ICollection } from '../models/Collection';

export interface CreateCollectionInput {
  name: string;
  parentId?: string | null;
}

export interface UpdateCollectionInput {
  name?: string;
  parentId?: string | null;
  position?: number;
}

export interface ICollectionService {
  create(userId: string, data: CreateCollectionInput): Promise<ICollection>;
  getById(id: string, userId: string): Promise<ICollection | null>;
  list(userId: string): Promise<ICollection[]>;
  update(id: string, userId: string, data: UpdateCollectionInput): Promise<ICollection | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
