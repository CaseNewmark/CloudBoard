<script setup lang="ts">
import { nextTick, ref } from 'vue';

/**
 * Text on a node that can be edited in place: double-click to edit, Enter (single line)
 * or Ctrl/Cmd+Enter (multiline) or clicking away to save, Escape to cancel. The
 * double-click doesn't reach the node, so it doesn't also open the properties panel.
 */
const props = withDefaults(defineProps<{ value: string; multiline?: boolean; label: string; maxlength?: number }>(), {
  multiline: false,
  maxlength: undefined,
});
/** `commit` fires only when the text changed; `done` whenever editing ends (saved or cancelled). */
const emit = defineEmits<{ commit: [value: string]; done: [] }>();

const editing = ref(false);
const draft = ref('');
const field = ref<HTMLInputElement | HTMLTextAreaElement>();

async function startEditing(): Promise<void> {
  draft.value = props.value;
  editing.value = true;
  await nextTick();
  field.value?.focus();
  field.value?.select();
}

function commit(): void {
  if (!editing.value) return;
  editing.value = false;
  if (draft.value !== props.value) emit('commit', draft.value);
  emit('done');
}

function cancel(): void {
  editing.value = false;
  emit('done');
}

defineExpose({ startEditing });

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    cancel();
  } else if (event.key === 'Enter' && (!props.multiline || event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    commit();
  }
}
</script>

<template>
  <!-- nodrag/nowheel/nopan: Vue Flow leaves pointer and wheel events inside the editor alone. -->
  <textarea
    v-if="editing && multiline"
    ref="field"
    v-model="draft"
    class="inline-editor nodrag nowheel nopan"
    :aria-label="label"
    @keydown="onKeydown"
    @blur="commit"
    @dblclick.stop
  ></textarea>
  <input
    v-else-if="editing"
    ref="field"
    v-model="draft"
    class="inline-editor nodrag nopan"
    :aria-label="label"
    :maxlength="maxlength"
    @keydown="onKeydown"
    @blur="commit"
    @dblclick.stop
  />
  <span v-else class="inline-editable" :title="`Double-click to edit ${label.toLowerCase()}`" @dblclick.stop="startEditing">
    <slot>{{ value }}</slot>
  </span>
</template>

<style scoped>
.inline-editable {
  cursor: text;
}

.inline-editor {
  display: block;
  width: 100%;
  font: inherit;
  color: inherit;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid #a78bfa;
  border-radius: 4px;
  padding: 2px 4px;
  outline: none;
  box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.3);
}

textarea.inline-editor {
  resize: none;
  min-height: 6em;
  field-sizing: content;
}
</style>
