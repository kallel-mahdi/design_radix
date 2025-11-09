import { injectable } from 'inversify';
import { IProjectService } from '../interfaces/IProjectService';
import { ProjectLink, IProjectLink } from '../models/ProjectLink';
import { Reference, IReference } from '../models/Reference';
import { Collection, ICollection } from '../models/Collection';
import { ApplicationLogger } from '../utils/logger';
import mongoose from 'mongoose';

@injectable()
export class ProjectService implements IProjectService {
  async linkReference(userId: string, projectId: string, referenceId: string): Promise<IProjectLink> {
    ApplicationLogger.info('Linking reference to project', { userId, projectId, referenceId });

    const link = await ProjectLink.create({
      userId,
      projectId,
      referenceId: new mongoose.Types.ObjectId(referenceId)
    });

    ApplicationLogger.info('Reference linked to project', { userId, projectId, referenceId });
    return link;
  }

  async unlinkReference(userId: string, projectId: string, referenceId: string): Promise<boolean> {
    const result = await ProjectLink.deleteOne({
      userId,
      projectId,
      referenceId: new mongoose.Types.ObjectId(referenceId)
    });
    return result.deletedCount > 0;
  }

  async linkCollection(userId: string, projectId: string, collectionId: string): Promise<IProjectLink> {
    ApplicationLogger.info('Linking collection to project', { userId, projectId, collectionId });

    const link = await ProjectLink.create({
      userId,
      projectId,
      collectionId: new mongoose.Types.ObjectId(collectionId)
    });

    ApplicationLogger.info('Collection linked to project', { userId, projectId, collectionId });
    return link;
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

  async getReferenceProjects(userId: string, referenceId: string): Promise<string[]> {
    const links = await ProjectLink.find({
      userId,
      referenceId: new mongoose.Types.ObjectId(referenceId)
    });

    return links.map(link => link.projectId);
  }

  async getCollectionProjects(userId: string, collectionId: string): Promise<string[]> {
    const links = await ProjectLink.find({
      userId,
      collectionId: new mongoose.Types.ObjectId(collectionId)
    });

    return links.map(link => link.projectId);
  }
}
