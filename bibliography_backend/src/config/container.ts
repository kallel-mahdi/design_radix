import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Interfaces
import { IReferenceService } from '../interfaces/IReferenceService';
import { ICollectionService } from '../interfaces/ICollectionService';
import { ITagService } from '../interfaces/ITagService';
import { IProjectService } from '../interfaces/IProjectService';
import { IDuplicateService } from '../interfaces/IDuplicateService';

// Implementations
import { ReferenceService } from '../services/ReferenceService';
import { CollectionService } from '../services/CollectionService';
import { TagService } from '../services/TagService';
import { ProjectService } from '../services/ProjectService';
import { DuplicateService } from '../services/DuplicateService';

// Controllers
import { ReferenceController } from '../controllers/ReferenceController';
import { CollectionController } from '../controllers/CollectionController';
import { TagController } from '../controllers/TagController';
import { ProjectController } from '../controllers/ProjectController';
import { DuplicateController } from '../controllers/DuplicateController';
import { HealthController } from '../controllers/HealthController';

const container = new Container();
let isConfigured = false;

export function configureContainer() {
  if (isConfigured) {
    return container;
  }

  // Bind services with singleton scope (shared instance across requests)
  container.bind<IReferenceService>(TYPES.IReferenceService).to(ReferenceService).inSingletonScope();
  container.bind<ICollectionService>(TYPES.ICollectionService).to(CollectionService).inSingletonScope();
  container.bind<ITagService>(TYPES.ITagService).to(TagService).inSingletonScope();
  container.bind<IProjectService>(TYPES.IProjectService).to(ProjectService).inSingletonScope();
  container.bind<IDuplicateService>(TYPES.IDuplicateService).to(DuplicateService).inSingletonScope();

  // Bind controllers (transient scope - new instance per request)
  container.bind<ReferenceController>(TYPES.ReferenceController).to(ReferenceController);
  container.bind<CollectionController>(TYPES.CollectionController).to(CollectionController);
  container.bind<TagController>(TYPES.TagController).to(TagController);
  container.bind<ProjectController>(TYPES.ProjectController).to(ProjectController);
  container.bind<DuplicateController>(TYPES.DuplicateController).to(DuplicateController);
  container.bind<HealthController>(TYPES.HealthController).to(HealthController);

  isConfigured = true;
  return container;
}

export function resetContainer() {
  container.unbindAll();
  isConfigured = false;
}

export { container, TYPES };
