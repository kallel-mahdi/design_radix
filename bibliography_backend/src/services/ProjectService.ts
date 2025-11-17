import { injectable } from 'inversify';
import { IProjectService } from '../interfaces/IProjectService';
import { ProjectLink, IProjectLink } from '../models/ProjectLink';
import { Reference, IReference } from '../models/Reference';
import { Collection, ICollection } from '../models/Collection';
import { ApplicationLogger } from '../utils/logger';
import { DocumentNotFoundError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

@injectable()
export class ProjectService implements IProjectService {
  async linkReference(userId: string, projectId: string, referenceId: string): Promise<any> {
    ApplicationLogger.info('Linking reference to project', { userId, projectId, referenceId });

    const refId = new mongoose.Types.ObjectId(referenceId);

    // Validate that reference exists before linking
    const reference = await Reference.findOne({
      _id: refId,
      userId,
      deleted: false
    });

    if (!reference) {
      throw new DocumentNotFoundError('Reference not found');
    }

    // Check if link already exists
    const existing = await ProjectLink.findOne({
      userId,
      projectId,
      referenceId: refId
    });

    // If exists, return with isNew flag
    if (existing) {
      ApplicationLogger.info('Reference already linked to project', { userId, projectId, referenceId });
      return {
        _id: existing._id,
        userId: existing.userId,
        projectId: existing.projectId,
        referenceId: existing.referenceId,
        createdAt: existing.createdAt,
        isNew: false
      };
    }

    // Create new link (idempotent approach: create new if not exists)
    const link = await ProjectLink.create({
      userId,
      projectId,
      referenceId: refId
    });

    ApplicationLogger.info('Reference linked to project', { userId, projectId, referenceId });
    return {
      _id: link._id,
      userId: link.userId,
      projectId: link.projectId,
      referenceId: link.referenceId,
      createdAt: link.createdAt,
      isNew: true
    };
  }

  async unlinkReference(userId: string, projectId: string, referenceId: string): Promise<boolean> {
    const result = await ProjectLink.deleteOne({
      userId,
      projectId,
      referenceId: new mongoose.Types.ObjectId(referenceId)
    });
    return result.deletedCount > 0;
  }

  async linkCollection(userId: string, projectId: string, collectionId: string): Promise<any> {
    ApplicationLogger.info('Linking collection to project', { userId, projectId, collectionId });

    const colId = new mongoose.Types.ObjectId(collectionId);

    // Validate that collection exists before linking
    const collection = await Collection.findOne({
      _id: colId,
      userId,
      deleted: false
    });

    if (!collection) {
      throw new DocumentNotFoundError('Collection not found');
    }

    // Check if link already exists
    const existing = await ProjectLink.findOne({
      userId,
      projectId,
      collectionId: colId
    });

    // If exists, return with isNew flag
    if (existing) {
      ApplicationLogger.info('Collection already linked to project', { userId, projectId, collectionId });
      return {
        _id: existing._id,
        userId: existing.userId,
        projectId: existing.projectId,
        collectionId: existing.collectionId,
        createdAt: existing.createdAt,
        isNew: false
      };
    }

    // Create new link (idempotent approach: create new if not exists)
    const link = await ProjectLink.create({
      userId,
      projectId,
      collectionId: colId
    });

    ApplicationLogger.info('Collection linked to project', { userId, projectId, collectionId });
    return {
      _id: link._id,
      userId: link.userId,
      projectId: link.projectId,
      collectionId: link.collectionId,
      createdAt: link.createdAt,
      isNew: true
    };
  }

  async unlinkCollection(userId: string, projectId: string, collectionId: string): Promise<boolean> {
    const result = await ProjectLink.deleteOne({
      userId,
      projectId,
      collectionId: new mongoose.Types.ObjectId(collectionId)
    });
    return result.deletedCount > 0;
  }

  async getProjectReferences(userId: string, projectId: string): Promise<IReference[]> {
    const links = await ProjectLink.find({ userId, projectId, referenceId: { $exists: true } });
    const referenceIds = links.map(link => link.referenceId).filter(Boolean);

    return Reference.find({
      _id: { $in: referenceIds },
      userId,
      deleted: false
    });
  }

  async getProjectCollections(userId: string, projectId: string): Promise<ICollection[]> {
    const links = await ProjectLink.find({ userId, projectId, collectionId: { $exists: true } });
    const collectionIds = links.map(link => link.collectionId).filter(Boolean);

    return Collection.find({
      _id: { $in: collectionIds },
      userId
    });
  }

  async getReferenceProjects(userId: string, referenceId: string): Promise<IProjectLink[]> {
    // Validate reference exists
    const reference = await Reference.findOne({
      _id: referenceId,
      userId,
      deleted: false
    });

    if (!reference) {
      throw new DocumentNotFoundError('Reference not found');
    }

    const links = await ProjectLink.find({
      userId,
      referenceId: new mongoose.Types.ObjectId(referenceId)
    });

    return links;
  }

  async getCollectionProjects(userId: string, collectionId: string): Promise<IProjectLink[]> {
    // Validate collection exists
    const collection = await Collection.findOne({
      _id: collectionId,
      userId,
      deleted: false
    });

    if (!collection) {
      throw new DocumentNotFoundError('Collection not found');
    }

    const links = await ProjectLink.find({
      userId,
      collectionId: new mongoose.Types.ObjectId(collectionId)
    });

    return links;
  }
}
