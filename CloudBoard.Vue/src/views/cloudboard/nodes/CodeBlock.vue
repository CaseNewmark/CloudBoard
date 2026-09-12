<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import type { Node } from '@/models/cloudboard';
import { useNodeProperty } from '@/composables/useNodeProperty';

const props = defineProps<{ node: Node }>();
const { getProperty } = useNodeProperty(() => props.node);

const code = computed(() => getProperty<string>('code', '// Your code here'));
const language = computed(() => getProperty<string>('language', 'javascript'));
const showLineNumbers = computed(() => getProperty<boolean>('showLineNumbers', true));

// Basic implementation for JS/TS syntax highlighting, ported as-is from CloudBoard.Angular.
const highlightedCode = computed(() => {
  if (!code.value) return '';

  let highlighted = code.value;

  if (language.value === 'javascript' || language.value === 'typescript') {
    highlighted = highlighted.replace(
      /\b(const|let|var|function|return|if|else|for|while|class|export|import|from|as|interface|type|extends|implements|new|this|super|switch|case|break|default|try|catch|finally|throw|async|await|static|public|private|protected)\b/g,
      '<span class="keyword">$1</span>',
    );
    highlighted = highlighted.replace(/(['"`])(.*?)\1/g, '<span class="string">$1$2$1</span>');
    highlighted = highlighted.replace(/\/\/(.*)/g, '<span class="comment">//$1</span>');
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
  }

  return highlighted;
});
</script>

<template>
  <Card :header="node.name" class="code-block-node">
    <div class="code-block">
      <div class="code-header">
        <span class="language-badge">{{ language }}</span>
      </div>
      <pre :class="{ 'with-line-numbers': showLineNumbers }"><code v-html="highlightedCode"></code></pre>
    </div>
  </Card>
</template>

<style>
/* Unscoped to match CloudBoard.Angular's ViewEncapsulation.None on this component. */
.code-block-node {
  min-width: 300px;
  max-width: 500px;
}

.code-block-node .code-block {
  background-color: #1e1e1e;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.code-block-node .code-header {
  background-color: #2d2d2d;
  padding: 6px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #3e3e3e;
}

.code-block-node .language-badge {
  font-size: 12px;
  padding: 2px 6px;
  background-color: #4d4d4d;
  color: #e0e0e0;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.code-block-node pre {
  margin: 0;
  padding: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #e0e0e0;
  background-color: #1e1e1e;
  overflow-x: auto;
}

.code-block-node pre.with-line-numbers {
  counter-reset: line;
  padding-left: 3.5em;
  position: relative;
}

.code-block-node pre.with-line-numbers::before {
  content: '';
  display: block;
  position: absolute;
  left: 3em;
  top: 0;
  bottom: 0;
  border-left: 1px solid #3e3e3e;
  height: 100%;
}

.code-block-node pre.with-line-numbers code {
  display: block;
  position: relative;
  padding-left: 0.5em;
}

.code-block-node pre.with-line-numbers code::before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: 3em;
  padding-right: 1em;
  margin-left: -3.5em;
  text-align: right;
  color: #6d6d6d;
  border-right: none;
}

.code-block-node .keyword {
  color: #569cd6;
}
.code-block-node .string {
  color: #ce9178;
}
.code-block-node .comment {
  color: #6a9955;
}
.code-block-node .number {
  color: #b5cea8;
}
.code-block-node .function {
  color: #dcdcaa;
}
.code-block-node .class {
  color: #4ec9b0;
}
.code-block-node .variable {
  color: #9cdcfe;
}
</style>
