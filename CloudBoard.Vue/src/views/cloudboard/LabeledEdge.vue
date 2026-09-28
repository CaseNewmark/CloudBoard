<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getSmoothStepPath } from '@vue-flow/core';
import type { Connection } from '@/models/cloudboard';
import InlineEditableText from './nodes/InlineEditableText.vue';
import { connectionLabelEditingKey } from './connectionLabelEditing';

/** A smooth-step connection with an arrowhead and an optional label; double-click it to edit the label. */
const props = defineProps<EdgeProps<{ connection: Connection }>>();

const labelEditing = inject(connectionLabelEditingKey)!;
const editor = ref<InstanceType<typeof InlineEditableText>>();

const path = computed(() => getSmoothStepPath(props));
const label = computed(() => props.data?.connection.label ?? '');
const isEditing = computed(() => labelEditing.editingId.value === props.id);

// Double-clicking the edge (handled by the canvas) opens the editor, even with no label yet.
watch(isEditing, (editing) => {
  if (editing) void Promise.resolve().then(() => editor.value?.startEditing());
});
</script>

<template>
  <BaseEdge :id="id" :path="path[0]" :marker-end="markerEnd" :style="style" :interaction-width="interactionWidth" />
  <EdgeLabelRenderer>
    <div
      v-if="label || isEditing"
      class="connection-label nodrag nopan"
      :class="{ editing: isEditing }"
      :style="{ transform: `translate(-50%, -50%) translate(${path[1]}px, ${path[2]}px)` }"
    >
      <InlineEditableText
        ref="editor"
        :value="label"
        label="Connection label"
        :maxlength="200"
        @commit="(text) => labelEditing.save(id, text)"
        @done="labelEditing.stop(id)"
      />
    </div>
  </EdgeLabelRenderer>
</template>

<style scoped>
.connection-label {
  position: absolute;
  pointer-events: all;
  padding: 2px 8px;
  border-radius: 9999px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.2);
  font-size: 0.8rem;
  color: #374151;
  max-width: 16rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.connection-label.editing {
  min-width: 10rem;
  overflow: visible;
}
</style>
