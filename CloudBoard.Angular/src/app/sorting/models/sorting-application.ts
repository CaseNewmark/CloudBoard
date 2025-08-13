// Enums
export enum ProcessStepType {
  Rougher = 'Rougher',
  Cleaner = 'Cleaner',
  Scavenger = 'Scavenger'
}

export enum BusinessUnit {
  WasteRecycling = 'WasteRecycling',
  MetalRecycling = 'MetalRecycling'
}

export enum MaterialCategory {
  Plastic = 'Plastic',
  Paper = 'Paper',
  Metal = 'Metal',
  Glass = 'Glass',
  Wood = 'Wood',
  Textile = 'Textile',
  Other = 'Other'
}

export enum MaterialForm {
  Rigid = 'Rigid',
  Film = 'Film',
  Flexible = 'Flexible',
  Bottle = 'Bottle',
  Tray = 'Tray',
  Other = 'Other'
}

// Domain Models
export interface SortingApplication {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  processSteps: ProcessStep[];
}

export interface ProcessStep {
  id: string;
  processStepId: string; // DE-W01-001
  stepCode: string; // 001
  processStepName: string; // FKN Rougher
  stepType: ProcessStepType;
  infeedMaterialDescription: string;
  mainMaterialForEjection: string;
  conflictingMaterials: string;
  order: number;
  marketSegment: MarketSegment;
  targetMaterials: TargetMaterial[];
}

export interface MarketSegment {
  id: string;
  segmentCode: string; // W01
  segmentName: string; // Mixed Light Packaging
  country: string; // DE
  businessUnit: BusinessUnit;
  description: string;
}

export interface TargetMaterial {
  id: string;
  materialCode: string; // PE-HD, PP, PET
  materialName: string; // Polyethylene High Density
  category: MaterialCategory;
  color: string;
  form: MaterialForm;
  isContaminant: boolean;
}

// Properties for SortingApplication nodes
export interface SortingApplicationProperties extends NodeProperties {
  applicationName: string;
  description: string;
  processStepCount: number;
  marketSegment: string;
  targetMaterials: string[];
}

// Base properties interface (from existing CloudBoard)
export interface NodeProperties {
  [key: string]: any;
  width?: string;
  height?: string;
}
