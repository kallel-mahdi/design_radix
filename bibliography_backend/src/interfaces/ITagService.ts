import mongoose from 'mongoose';
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

// Plain object type for API responses (not Mongoose document)
// Used with .toObject() which returns plain JS object, not Mongoose document
export interface TagWithUsageCount {
  _id: mongoose.Types.ObjectId;
  userId: string;
  name: string;
  color: string | null;
  position: number | null;
  automatic: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export interface ITagService {
  create(userId: string, data: CreateTagInput): Promise<TagWithUsageCount>;
  getById(id: string, userId: string): Promise<ITag | null>;
  getByName(name: string, userId: string): Promise<ITag | null>;
  list(userId: string): Promise<TagWithUsageCount[]>;
  update(id: string, userId: string, data: UpdateTagInput): Promise<ITag | null>;
  updateColor(name: string, userId: string, color: string | null, position?: number | null): Promise<TagWithUsageCount | null>;
  rename(oldName: string, newName: string, userId: string): Promise<TagWithUsageCount | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
