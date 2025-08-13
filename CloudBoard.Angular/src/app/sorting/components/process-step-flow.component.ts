import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ProcessStep, ProcessStepType, MaterialCategory } from '../models/sorting-application';

@Component({
  selector: 'app-process-step-flow',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, BadgeModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="process-step-flow">
      <h3 class="text-xl font-semibold mb-4">Process Flow</h3>
      
      <div class="flex flex-wrap gap-3 align-items-center">
        <div 
          *ngFor="let step of processSteps; let i = index; trackBy: trackByStepId"
          class="flex align-items-center">
          
          <!-- Process Step Card -->
          <p-card styleClass="process-step-card shadow-2">
            <div class="text-center">
              <!-- Step Type Icon -->
              <div class="step-icon mb-2" [class]="getStepIconClass(step.stepType)">
                <i [class]="getStepIcon(step.stepType)"></i>
              </div>
              
              <!-- Step Information -->
              <div class="step-info">
                <div class="font-semibold text-sm mb-1">{{ step.processStepName }}</div>
                <div class="text-xs text-500 mb-2">{{ step.processStepId }}</div>
                
                <p-tag 
                  [value]="step.stepType" 
                  [severity]="getStepTypeSeverity(step.stepType)"
                  size="small"
                  class="mb-2">
                </p-tag>
              </div>

              <!-- Target Materials -->
              <div class="materials-section mt-2" *ngIf="step.targetMaterials.length > 0">
                <div class="text-xs text-600 mb-1">Target Materials:</div>
                <div class="flex flex-wrap gap-1 justify-content-center">
                  <p-badge 
                    *ngFor="let material of step.targetMaterials.slice(0, 3)" 
                    [value]="material.materialCode"
                    [severity]="getMaterialSeverity(material.category)"
                    size="small">
                  </p-badge>
                  <p-badge 
                    *ngIf="step.targetMaterials.length > 3"
                    [value]="'+' + (step.targetMaterials.length - 3)"
                    severity="secondary"
                    size="small">
                  </p-badge>
                </div>
              </div>

              <!-- Main Material Output -->
              <div class="output-section mt-2" *ngIf="step.mainMaterialForEjection">
                <div class="text-xs text-600 mb-1">Output:</div>
                <div class="font-medium text-xs text-primary">{{ step.mainMaterialForEjection }}</div>
              </div>
            </div>
          </p-card>
          
          <!-- Flow Arrow -->
          <div *ngIf="i < processSteps.length - 1" class="flow-arrow mx-2">
            <i class="pi pi-arrow-right text-primary text-xl"></i>
          </div>
        </div>
      </div>

      <!-- Process Summary -->
      <div class="process-summary mt-4 p-3 surface-100 border-round">
        <div class="grid">
          <div class="col-12 md:col-3">
            <div class="text-center">
              <div class="text-primary font-semibold text-lg">{{ processSteps.length }}</div>
              <div class="text-sm text-600">Total Steps</div>
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="text-center">
              <div class="text-green-600 font-semibold text-lg">{{ getRougherCount() }}</div>
              <div class="text-sm text-600">Roughers</div>
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="text-center">
              <div class="text-orange-600 font-semibold text-lg">{{ getCleanerCount() }}</div>
              <div class="text-sm text-600">Cleaners</div>
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="text-center">
              <div class="text-blue-600 font-semibold text-lg">{{ getScavengerCount() }}</div>
              <div class="text-sm text-600">Scavengers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .process-step-flow {
      padding: 1rem;
    }

    :host ::ng-deep {
      .process-step-card {
        min-width: 180px;
        transition: transform 0.2s ease;
      }
      
      .process-step-card:hover {
        transform: translateY(-2px);
      }
      
      .process-step-card .p-card-body {
        padding: 1rem;
      }
    }

    .step-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      font-size: 1.2rem;
      color: white;
    }

    .step-icon.rougher { background-color: #22c55e; }
    .step-icon.cleaner { background-color: #f97316; }
    .step-icon.scavenger { background-color: #3b82f6; }

    .flow-arrow {
      flex-shrink: 0;
    }

    .materials-section, .output-section {
      border-top: 1px solid var(--surface-300);
      padding-top: 0.5rem;
    }
  `]
})
export class ProcessStepFlowComponent {
  @Input() processSteps: ProcessStep[] = [];

  public getStepIcon(stepType: ProcessStepType): string {
    switch (stepType) {
      case ProcessStepType.Rougher: return 'pi pi-filter';
      case ProcessStepType.Cleaner: return 'pi pi-verified';
      case ProcessStepType.Scavenger: return 'pi pi-search';
      default: return 'pi pi-cog';
    }
  }

  public getStepIconClass(stepType: ProcessStepType): string {
    return `step-icon ${stepType.toLowerCase()}`;
  }

  public getStepTypeSeverity(stepType: ProcessStepType): 'success' | 'warning' | 'info' {
    switch (stepType) {
      case ProcessStepType.Rougher: return 'success';
      case ProcessStepType.Cleaner: return 'warning';
      case ProcessStepType.Scavenger: return 'info';
      default: return 'info';
    }
  }

  public getMaterialSeverity(category: MaterialCategory): 'success' | 'info' | 'warn' | 'danger' {
    switch (category) {
      case MaterialCategory.Plastic: return 'info';
      case MaterialCategory.Paper: return 'success';
      case MaterialCategory.Metal: return 'warn';
      case MaterialCategory.Glass: return 'info';
      default: return 'success';
    }
  }

  public getRougherCount(): number {
    return this.processSteps.filter(step => step.stepType === ProcessStepType.Rougher).length;
  }

  public getCleanerCount(): number {
    return this.processSteps.filter(step => step.stepType === ProcessStepType.Cleaner).length;
  }

  public getScavengerCount(): number {
    return this.processSteps.filter(step => step.stepType === ProcessStepType.Scavenger).length;
  }

  public trackByStepId(index: number, step: ProcessStep): string {
    return step.id;
  }
}
