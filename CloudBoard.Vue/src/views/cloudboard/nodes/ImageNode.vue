<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import Image from 'primevue/image';
import type { Node } from '@/models/cloudboard';
import { useNodeProperty } from '@/composables/useNodeProperty';
import { useImageSource } from '@/composables/useImageSource';

const props = defineProps<{ node: Node }>();
const { getProperty } = useNodeProperty(() => props.node);

const url = computed(() => getProperty<string>('url', 'https://picsum.photos/300/200'));
const alt = computed(() => getProperty<string>('alt', ''));
const caption = computed(() => getProperty<string>('caption', ''));
const { src, failed } = useImageSource(() => url.value);
</script>

<template>
  <Card class="image-node">
    <template #title>{{ node.name }}</template>
    <template #content>
      <Image v-if="src" :src="src" :alt="alt || node.name" image-class="w-full" :preview="true" />
      <div v-else class="image-placeholder">
        <i class="pi" :class="failed ? 'pi-exclamation-triangle' : 'pi-spin pi-spinner'"></i>
        {{ failed ? 'Image unavailable' : 'Loading image…' }}
      </div>
      <div class="image-caption">
        {{ caption }}
      </div>
    </template>
  </Card>
</template>

<style scoped>
.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 8rem;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 4px;
}

.image-node {
  min-width: 250px;
  max-width: 350px;
}

.image-node :deep(.p-card-content) {
  padding: 0;
  overflow: hidden;
}

.image-caption {
  padding: 10px;
  text-align: center;
  font-style: italic;
  color: #555;
  font-size: 0.9rem;
  border-top: 1px solid #eee;
  background-color: #f9f9f9;
}

:deep(.p-image img) {
  transition: transform 0.3s ease;
}

:deep(.p-image:hover img) {
  transform: scale(1.05);
}
</style>
