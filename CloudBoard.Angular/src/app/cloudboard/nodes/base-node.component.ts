import { Component, input, inject } from '@angular/core';
import { Node } from '../models/cloudboard';
import { NodeService } from '../services/node.service';

@Component({
  template: ''
})
export abstract class BaseNodeComponent {
  node = input<Node>();
  private nodeService = inject(NodeService);
  private propertyUpdateTimer: ReturnType<typeof setTimeout> | null = null;
  
  // Function to update a specific property
  updateProperty(key: string, value: any): void {
    if (this.node() && this.node()!.properties) {
      // Update locally for immediate feedback
      this.node()!.properties[key] = value;
      
      // Debounce API update to avoid too many calls
      if (this.propertyUpdateTimer) {
        clearTimeout(this.propertyUpdateTimer);
      }
      
      this.propertyUpdateTimer = setTimeout(() => {
        const updatedNode = { ...this.node()! };
        
        // Call API to update the node
        this.nodeService.updateNode(this.node()!.id, updatedNode).subscribe();
      }, 500); // 500ms debounce
    }
  }
  
  // Function to get a property with a default value if not set
  getProperty<T>(key: string, defaultValue: T): T {
    if (this.node() && this.node()!.properties && this.node()!.properties[key] !== undefined) {
      return this.node()!.properties[key] as T;
    }
    return defaultValue;
  }
}
