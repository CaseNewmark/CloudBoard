import { Component, input } from '@angular/core';
import { Node } from '../data/cloudboard';

@Component({
  template: ''
})
export abstract class BaseNodeComponent {
  node = input<Node>();
  
  // Function to update a specific property
  updateProperty(key: string, value: any): void {
    if (this.node() && this.node()!.properties) {
      this.node()!.properties[key] = value;
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
