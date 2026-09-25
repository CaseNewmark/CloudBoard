<script setup lang="ts">
import { computed } from 'vue';
import type { Node } from '@/models/cloudboard';
import { useNodeProperty } from '@/composables/useNodeProperty';

const props = defineProps<{ node: Node }>();
const { getProperty, updateProperty } = useNodeProperty(() => props.node);

const content = computed({
  get: () => getProperty<string>('content', 'Empty note...'),
  set: (value) => updateProperty('content', value),
});
const backgroundColor = computed(() => getProperty<string>('backgroundColor', 'rgb(255, 249, 212)'));
const textColor = computed(() => getProperty<string>('textColor', '#000000'));
</script>

<template>
  <div class="simple-note shadow-md" :style="{ 'background-color': backgroundColor, color: textColor }">
    <p class="m-0 whitespace-pre-wrap" :style="{ color: textColor }">
      {{ content }}
    </p>
  </div>
</template>

<style scoped>
.simple-note {
  min-height: 10em;
  padding: 1rem;
  min-width: 20rem;
  max-width: 20rem;
}
</style>
