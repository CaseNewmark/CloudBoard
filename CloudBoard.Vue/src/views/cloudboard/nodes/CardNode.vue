<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import Image from 'primevue/image';
import type { Node } from '@/models/cloudboard';
import { useNodeProperty } from '@/composables/useNodeProperty';

const props = defineProps<{ node: Node }>();
const { getProperty } = useNodeProperty(() => props.node);

const title = computed(() => getProperty<string>('title', 'Card Title'));
const subtitle = computed(() => getProperty<string>('subtitle', ''));
const imageUrl = computed(() => getProperty<string>('imageUrl', ''));
const content = computed(() => getProperty<string>('content', 'Card content...'));
const hasImage = computed(() => !!imageUrl.value && imageUrl.value.trim().length > 0);
</script>

<template>
  <Card class="card-node">
    <template v-if="hasImage" #header>
      <Image class="pointer-events-none" :src="imageUrl" :alt="node.name" image-class="w-full h-auto" :preview="false" />
    </template>
    <template #title>
      <div class="card-title">{{ title }}</div>
    </template>
    <template v-if="subtitle" #subtitle>
      <div class="card-subtitle">{{ subtitle }}</div>
    </template>
    <div class="card-content">
      {{ content }}
    </div>
  </Card>
</template>

<style scoped>
.card-node :deep(.p-card) {
  border-radius: 8px;
  overflow: hidden;
  min-width: 10em;
  max-width: 18.5em;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-node :deep(.p-card:hover) {
  transform: scale(1.0001);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-node :deep(.p-card .p-card-body) {
  padding: 1.25rem;
}

.card-node :deep(.p-card .p-card-title) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.25rem;
}

.card-node :deep(.p-card .p-card-subtitle) {
  font-weight: 400;
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.75rem;
}

.card-node :deep(.p-card .p-card-content) {
  padding: 0.5rem 0 0 0;
  color: #495057;
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.card-node :deep(.p-card .p-card-header img) {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card-node :deep(.p-card:hover .p-card-header img) {
  transform: scale(1.03);
}
</style>
