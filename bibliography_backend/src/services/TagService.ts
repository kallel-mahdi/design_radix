import { injectable } from 'inversify';
import { ITagService, CreateTagInput, UpdateTagInput } from '../interfaces/ITagService';
import { Tag, ITag } from '../models/Tag';
import { ApplicationLogger } from '../utils/logger';

@injectable()
export class TagService implements ITagService {
  async create(userId: string, data: CreateTagInput): Promise<ITag> {
    ApplicationLogger.info('Creating tag', { userId, name: data.name });

    const tag = await Tag.create({
      userId,
      name: data.name,
      color: data.color || null,
      position: data.position || null,
      automatic: false
    });

    ApplicationLogger.info('Tag created', { userId, tagId: tag._id.toString() });
    return tag;
  }

  async getById(id: string, userId: string): Promise<ITag | null> {
    return Tag.findOne({ _id: id, userId });
  }

  async getByName(name: string, userId: string): Promise<ITag | null> {
    return Tag.findOne({ userId, name });
  }

  async list(userId: string): Promise<ITag[]> {
    return Tag.find({ userId }).sort({ position: 1, name: 1 });
  }

  async update(id: string, userId: string, data: UpdateTagInput): Promise<ITag | null> {
    return Tag.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true }
    );
  }

  async updateColor(name: string, userId: string, color: string | null, position: number | null): Promise<ITag | null> {
    ApplicationLogger.info('Updating tag color', { userId, name, color, position });

    // Enforce max 9 colored tags
    if (color !== null && position !== null) {
      const coloredTagsCount = await Tag.countDocuments({
        userId,
        color: { $ne: null },
        name: { $ne: name }
      });

      if (coloredTagsCount >= 9) {
        throw new Error('MAX_COLORED_TAGS: Cannot have more than 9 colored tags');
      }

      if (position < 1 || position > 9) {
        throw new Error('INVALID_POSITION: Position must be between 1 and 9');
      }
    }

    const tag = await Tag.findOneAndUpdate(
      { userId, name },
      { $set: { color, position } },
      { new: true }
    );

    if (tag) {
      ApplicationLogger.info('Tag color updated', { userId, name, tagId: tag._id.toString() });
    }

    return tag;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await Tag.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }
}
