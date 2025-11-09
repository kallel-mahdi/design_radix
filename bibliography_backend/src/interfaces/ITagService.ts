import { ITag } from '../models/Tag';

export interface CreateTagInput {
  name: string;
  color?: string | null;
  position?: number | null;
}

export interface UpdateTagInput {
  name?: string;
  color?: string | null;
  position?: number | null;
}

export interface ITagService {
  create(userId: string, data: CreateTagInput): Promise<ITag>;
  getById(id: string, userId: string): Promise<ITag | null>;
  getByName(name: string, userId: string): Promise<ITag | null>;
  list(userId: string): Promise<ITag[]>;
  update(id: string, userId: string, data: UpdateTagInput): Promise<ITag | null>;
  updateColor(name: string, userId: string, color: string | null, position: number | null): Promise<ITag | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
