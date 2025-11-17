import { injectable } from 'inversify';
import { ITagService, CreateTagInput, UpdateTagInput } from '../interfaces/ITagService';
import { Tag, ITag } from '../models/Tag';
import { Reference } from '../models/Reference';
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

  async list(userId: string): Promise<Array<any>> {
    // Get all tags
    const tags = await Tag.find({ userId });

    // Calculate usage count for each tag using aggregation
    const tagsWithCounts = await Promise.all(
      tags.map(async (tag) => {
        const count = await Reference.countDocuments({
          userId,
          tags: tag.name,
          deleted: false
        });

        return {
          ...tag.toObject(),
          usageCount: count
        };
      })
    );

    // Sort by usage count descending (most used tags first)
    return tagsWithCounts.sort((a, b) => b.usageCount - a.usageCount);
  }

  async update(id: string, userId: string, data: UpdateTagInput): Promise<ITag | null> {
    return Tag.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true }
    );
  }

  async updateColor(name: string, userId: string, color: string | null, position?: number | null): Promise<ITag | null> {
    ApplicationLogger.info('Updating tag color', { userId, name, color, position });

    const tag = await Tag.findOne({ userId, name });
    if (!tag) {
      return null;
    }

    if (color !== null) {
      // Setting a color - auto-calculate position if not provided
      if (position === undefined || position === null) {
        // Find first available position (1-9)
        const coloredTags = await Tag.find({
          userId,
          color: { $ne: null },
          _id: { $ne: tag._id }
        }).select('position').sort('position');

        const usedPositions = new Set(coloredTags.map(t => t.position).filter(p => p !== null));

        // Find first gap in 1-9
        let availablePosition = null;
        for (let i = 1; i <= 9; i++) {
          if (!usedPositions.has(i)) {
            availablePosition = i;
            break;
          }
        }

        if (availablePosition === null) {
          throw new Error('MAX_COLORED_TAGS: Maximum 9 colored tags allowed');
        }

        position = availablePosition;
      } else {
        // Validate provided position
        if (position < 1 || position > 9) {
          throw new Error('INVALID_POSITION: Position must be between 1 and 9');
        }

        // Check if position already taken
        const existingAtPosition = await Tag.findOne({
          userId,
          position,
          _id: { $ne: tag._id }
        });

        if (existingAtPosition) {
          throw new Error('POSITION_TAKEN: Position already occupied by another tag');
        }
      }

      tag.color = color;
      tag.position = position;
    } else {
      // Clearing color - remove position and renumber remaining
      const oldPosition = tag.position;
      tag.color = null;
      tag.position = null;
      await tag.save();

      if (oldPosition !== null) {
        // Renumber tags with position > oldPosition
        await Tag.updateMany(
          { userId, position: { $gt: oldPosition } },
          { $inc: { position: -1 } }
        );
      }

      ApplicationLogger.info('Tag color cleared', { userId, name, tagId: tag._id.toString() });
      return tag;
    }

    await tag.save();
    ApplicationLogger.info('Tag color updated', { userId, name, tagId: tag._id.toString(), position });
    return tag;
  }

  async rename(oldName: string, newName: string, userId: string): Promise<ITag | null> {
    ApplicationLogger.info('Renaming tag', { userId, oldName, newName });

    // Check if new name already exists
    const existing = await Tag.findOne({ userId, name: newName });
    if (existing) {
      throw new Error('DUPLICATE_TAG_NAME: Tag with this name already exists');
    }

    // Update tag document
    const tag = await Tag.findOneAndUpdate(
      { userId, name: oldName },
      { $set: { name: newName } },
      { new: true }
    );

    if (!tag) {
      ApplicationLogger.warn('Tag not found for rename', { userId, oldName });
      return null;
    }

    // Update all references with this tag (cascade)
    const updateResult = await Reference.updateMany(
      { userId, tags: oldName },
      { $set: { 'tags.$': newName } }  // Replace oldName with newName in array
    );

    ApplicationLogger.info('Tag renamed', {
      userId,
      oldName,
      newName,
      tagId: tag._id.toString(),
      referencesUpdated: updateResult.modifiedCount
    });

    return tag;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    // First find the tag to get its name
    const tag = await Tag.findOne({ _id: id, userId });
    if (!tag) {
      ApplicationLogger.warn('Tag not found for delete', { userId, tagId: id });
      return false;
    }

    ApplicationLogger.info('Deleting tag with cascade', { userId, tagId: id, tagName: tag.name });

    // Remove tag from all references
    const removeResult = await Reference.updateMany(
      { userId, tags: tag.name },
      { $pull: { tags: tag.name } }  // Remove tag from array
    );

    // Delete tag document
    const result = await Tag.deleteOne({ _id: id, userId });

    if (result.deletedCount > 0) {
      ApplicationLogger.info('Tag deleted', {
        userId,
        tagId: id,
        tagName: tag.name,
        referencesUpdated: removeResult.modifiedCount
      });
      return true;
    }

    return false;
  }
}
