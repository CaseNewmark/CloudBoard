<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import hljs from 'highlight.js/lib/core';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/vs2015.css';
import type { Node } from '@/models/cloudboard';
import { useNodeProperty } from '@/composables/useNodeProperty';

// Only the languages offered in the properties panel, to keep the bundle small.
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('python', python);
hljs.registerLanguage('typescript', typescript);

const props = defineProps<{ node: Node }>();
const { getProperty } = useNodeProperty(() => props.node);

const code = computed(() => getProperty<string>('code', '// Your code here'));
const language = computed(() => getProperty<string>('language', 'javascript'));
const showLineNumbers = computed(() => getProperty<boolean>('showLineNumbers', true));

const lineCount = computed(() => (code.value ? code.value.split('\n').length : 1));

// highlight.js HTML-escapes the source, so the result is safe to render with v-html.
const highlightedCode = computed(() => {
  if (!code.value) return '';

  const lang = hljs.getLanguage(language.value) ? language.value : 'plaintext';
  if (lang === 'plaintext') {
    return escapeHtml(code.value);
  }
  return hljs.highlight(code.value, { language: lang, ignoreIllegals: true }).value;
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
</script>

<template>
  <Card class="code-block-node">
    <template #title>{{ node.name }}</template>
    <template #content>
      <div class="code-block">
        <div class="code-header">
          <span class="language-badge">{{ language }}</span>
        </div>
        <div class="code-body">
          <pre v-if="showLineNumbers" class="line-numbers" aria-hidden="true"><span
            v-for="line in lineCount"
            :key="line"
          >{{ line }}</span></pre>
          <pre class="code"><code v-html="highlightedCode"></code></pre>
        </div>
      </div>
    </template>
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

.code-block-node .code-body {
  display: flex;
  background-color: #1e1e1e;
}

.code-block-node pre {
  margin: 0;
  padding: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.code-block-node pre.code {
  flex: 1;
  min-width: 0;
  white-space: pre;
  color: #dcdcdc;
  overflow-x: auto;
}

.code-block-node pre.line-numbers {
  padding-right: 8px;
  text-align: right;
  color: #6d6d6d;
  border-right: 1px solid #3e3e3e;
  user-select: none;
}

.code-block-node pre.line-numbers span {
  display: block;
}
</style>
