// DI container type symbols
// Adapted from editor auth-service pattern

export const TYPES = {
  // Services
  IReferenceService: Symbol.for('IReferenceService'),
  ICollectionService: Symbol.for('ICollectionService'),
  ITagService: Symbol.for('ITagService'),
  IProjectService: Symbol.for('IProjectService'),
  IDuplicateService: Symbol.for('IDuplicateService'),
  ICrossrefService: Symbol.for('ICrossrefService'),
  ISearchService: Symbol.for('ISearchService'),
  IPdfService: Symbol.for('IPdfService'),
  IPdfMetadataService: Symbol.for('IPdfMetadataService'), // Session 10.5
  IAnnotationService: Symbol.for('IAnnotationService'), // PDF annotations

  // Controllers
  ReferenceController: Symbol.for('ReferenceController'),
  CollectionController: Symbol.for('CollectionController'),
  TagController: Symbol.for('TagController'),
  ProjectController: Symbol.for('ProjectController'),
  DuplicateController: Symbol.for('DuplicateController'),
  SearchController: Symbol.for('SearchController'),
  HealthController: Symbol.for('HealthController'),
  AnnotationController: Symbol.for('AnnotationController'), // PDF annotations
};
