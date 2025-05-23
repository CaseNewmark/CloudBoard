import { Component, ViewEncapsulation } from '@angular/core';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { FFlowModule } from '@foblex/flow';
import { BaseNodeComponent } from '../base-node.component';
import { CodeBlockProperties } from '../../data/cloudboard';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'code-block',
  standalone: true,
  imports: [
    FFlowModule,
    CardModule,
    FormsModule
  ],
  templateUrl: './code-block.component.html',
  styleUrl: './code-block.component.css',
  encapsulation: ViewEncapsulation.None // Allow styles to be applied globally
})
export class CodeBlockComponent extends BaseNodeComponent {
  // Get code with default value if not set
  get code(): string {
    return this.getProperty<string>('code', '// Your code here');
  }
  
  // Set code property
  set code(value: string) {
    this.updateProperty('code', value);
  }
  
  // Get language with default value if not set
  get language(): string {
    return this.getProperty<string>('language', 'javascript');
  }
  
  // Set language property
  set language(value: string) {
    this.updateProperty('language', value);
  }
  
  // Get showLineNumbers with default value if not set
  get showLineNumbers(): boolean {
    return this.getProperty<boolean>('showLineNumbers', true);
  }
  
  // Set showLineNumbers property
  set showLineNumbers(value: boolean) {
    this.updateProperty('showLineNumbers', value);
  }

  // Apply basic syntax highlighting based on the language
  highlightCode(): string {
    if (!this.code) return '';

    let highlightedCode = this.code;
    
    // Basic implementation for JS/TS syntax highlighting
    if (this.language === 'javascript' || this.language === 'typescript') {
      // Keywords
      highlightedCode = highlightedCode.replace(
        /\b(const|let|var|function|return|if|else|for|while|class|export|import|from|as|interface|type|extends|implements|new|this|super|switch|case|break|default|try|catch|finally|throw|async|await|static|public|private|protected)\b/g, 
        '<span class="keyword">$1</span>'
      );
      
      // Strings
      highlightedCode = highlightedCode.replace(
        /(['"`])(.*?)\1/g, 
        '<span class="string">$1$2$1</span>'
      );
      
      // Comments
      highlightedCode = highlightedCode.replace(
        /\/\/(.*)/g, 
        '<span class="comment">//\$1</span>'
      );
      
      // Numbers
      highlightedCode = highlightedCode.replace(
        /\b(\d+)\b/g, 
        '<span class="number">$1</span>'
      );
    }
    
    return highlightedCode;
  }
}
