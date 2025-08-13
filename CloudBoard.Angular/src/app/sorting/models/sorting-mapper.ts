import { 
  SortingApplication, 
  ProcessStep, 
  MarketSegment, 
  TargetMaterial,
  ProcessStepType,
  BusinessUnit,
  MaterialCategory,
  MaterialForm
} from './sorting-application';

// Temporary DTO interfaces until API client is regenerated
export interface SortingApplicationDto {
  id?: string;
  name?: string;
  description?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  processSteps?: ProcessStepDto[];
}

export interface ProcessStepDto {
  id?: string;
  processStepId?: string;
  stepCode?: string;
  processStepName?: string;
  stepType?: string;
  infeedMaterialDescription?: string;
  mainMaterialForEjection?: string;
  conflictingMaterials?: string;
  order?: number;
  marketSegment?: MarketSegmentDto;
  targetMaterials?: TargetMaterialDto[];
}

export interface MarketSegmentDto {
  id?: string;
  segmentCode?: string;
  segmentName?: string;
  country?: string;
  businessUnit?: string;
  description?: string;
}

export interface TargetMaterialDto {
  id?: string;
  materialCode?: string;
  materialName?: string;
  category?: string;
  color?: string;
  form?: string;
  isContaminant?: boolean;
}

// DTO to Domain mappings
export function mapSortingApplicationDtoToSortingApplication(dto: SortingApplicationDto): SortingApplication {
  return {
    id: dto.id!,
    name: dto.name!,
    description: dto.description!,
    createdBy: dto.createdBy!,
    createdAt: new Date(dto.createdAt!),
    updatedAt: new Date(dto.updatedAt!),
    processSteps: dto.processSteps?.map(stepDto => mapProcessStepDtoToProcessStep(stepDto)) || []
  };
}

export function mapProcessStepDtoToProcessStep(dto: ProcessStepDto): ProcessStep {
  return {
    id: dto.id!,
    processStepId: dto.processStepId!,
    stepCode: dto.stepCode!,
    processStepName: dto.processStepName!,
    stepType: mapStringToProcessStepType(dto.stepType!),
    infeedMaterialDescription: dto.infeedMaterialDescription!,
    mainMaterialForEjection: dto.mainMaterialForEjection!,
    conflictingMaterials: dto.conflictingMaterials!,
    order: dto.order!,
    marketSegment: mapMarketSegmentDtoToMarketSegment(dto.marketSegment!),
    targetMaterials: dto.targetMaterials?.map(matDto => mapTargetMaterialDtoToTargetMaterial(matDto)) || []
  };
}

export function mapMarketSegmentDtoToMarketSegment(dto: MarketSegmentDto): MarketSegment {
  return {
    id: dto.id!,
    segmentCode: dto.segmentCode!,
    segmentName: dto.segmentName!,
    country: dto.country!,
    businessUnit: mapStringToBusinessUnit(dto.businessUnit!),
    description: dto.description!
  };
}

export function mapTargetMaterialDtoToTargetMaterial(dto: TargetMaterialDto): TargetMaterial {
  return {
    id: dto.id!,
    materialCode: dto.materialCode!,
    materialName: dto.materialName!,
    category: mapStringToMaterialCategory(dto.category!),
    color: dto.color!,
    form: mapStringToMaterialForm(dto.form!),
    isContaminant: dto.isContaminant!
  };
}

// Domain to DTO mappings
export function mapSortingApplicationToSortingApplicationDto(app: SortingApplication): SortingApplicationDto {
  return {
    id: app.id,
    name: app.name,
    description: app.description,
    createdBy: app.createdBy,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    processSteps: app.processSteps.map(step => mapProcessStepToProcessStepDto(step))
  };
}

export function mapProcessStepToProcessStepDto(step: ProcessStep): ProcessStepDto {
  return {
    id: step.id,
    processStepId: step.processStepId,
    stepCode: step.stepCode,
    processStepName: step.processStepName,
    stepType: mapProcessStepTypeToString(step.stepType),
    infeedMaterialDescription: step.infeedMaterialDescription,
    mainMaterialForEjection: step.mainMaterialForEjection,
    conflictingMaterials: step.conflictingMaterials,
    order: step.order,
    marketSegment: mapMarketSegmentToMarketSegmentDto(step.marketSegment),
    targetMaterials: step.targetMaterials.map(mat => mapTargetMaterialToTargetMaterialDto(mat))
  };
}

export function mapMarketSegmentToMarketSegmentDto(segment: MarketSegment): MarketSegmentDto {
  return {
    id: segment.id,
    segmentCode: segment.segmentCode,
    segmentName: segment.segmentName,
    country: segment.country,
    businessUnit: mapBusinessUnitToString(segment.businessUnit),
    description: segment.description
  };
}

export function mapTargetMaterialToTargetMaterialDto(material: TargetMaterial): TargetMaterialDto {
  return {
    id: material.id,
    materialCode: material.materialCode,
    materialName: material.materialName,
    category: mapMaterialCategoryToString(material.category),
    color: material.color,
    form: mapMaterialFormToString(material.form),
    isContaminant: material.isContaminant
  };
}

// Helper mapping functions
function mapStringToProcessStepType(type: string): ProcessStepType {
  switch (type) {
    case 'Rougher': return ProcessStepType.Rougher;
    case 'Cleaner': return ProcessStepType.Cleaner;
    case 'Scavenger': return ProcessStepType.Scavenger;
    default: throw new Error(`Unknown process step type: ${type}`);
  }
}

function mapProcessStepTypeToString(type: ProcessStepType): string {
  return type.toString();
}

function mapStringToBusinessUnit(unit: string): BusinessUnit {
  switch (unit) {
    case 'WasteRecycling': return BusinessUnit.WasteRecycling;
    case 'MetalRecycling': return BusinessUnit.MetalRecycling;
    default: throw new Error(`Unknown business unit: ${unit}`);
  }
}

function mapBusinessUnitToString(unit: BusinessUnit): string {
  return unit.toString();
}

function mapStringToMaterialCategory(category: string): MaterialCategory {
  switch (category) {
    case 'Plastic': return MaterialCategory.Plastic;
    case 'Paper': return MaterialCategory.Paper;
    case 'Metal': return MaterialCategory.Metal;
    case 'Glass': return MaterialCategory.Glass;
    case 'Wood': return MaterialCategory.Wood;
    case 'Textile': return MaterialCategory.Textile;
    case 'Other': return MaterialCategory.Other;
    default: throw new Error(`Unknown material category: ${category}`);
  }
}

function mapMaterialCategoryToString(category: MaterialCategory): string {
  return category.toString();
}

function mapStringToMaterialForm(form: string): MaterialForm {
  switch (form) {
    case 'Rigid': return MaterialForm.Rigid;
    case 'Film': return MaterialForm.Film;
    case 'Flexible': return MaterialForm.Flexible;
    case 'Bottle': return MaterialForm.Bottle;
    case 'Tray': return MaterialForm.Tray;
    case 'Other': return MaterialForm.Other;
    default: throw new Error(`Unknown material form: ${form}`);
  }
}

function mapMaterialFormToString(form: MaterialForm): string {
  return form.toString();
}
