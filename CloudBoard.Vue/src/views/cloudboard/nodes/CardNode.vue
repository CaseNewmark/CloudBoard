<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import Image from 'primevue/image';
import type { Node } from '@/models/cloudboard';
import { useNodeProperty } from '@/composables/useNodeProperty';
import { useImageSource } from '@/composables/useImageSource';
import InlineEditableText from './InlineEditableText.vue';

const props = defineProps<{ node: Node }>();
const { getProperty, updateProperty } = useNodeProperty(() => props.node);

const title = computed(() => getProperty<string>('title', 'Card Title'));
const subtitle = computed(() => getProperty<string>('subtitle', ''));
const imageUrl = computed(() => getProperty<string>('imageUrl', ''));
const content = computed(() => getProperty<string>('content', 'Card content...'));
const { src: imageSrc } = useImageSource(() => imageUrl.value.trim() || undefined);
const hasImage = computed(() => !!imageSrc.value);
</script>

<template>
  <Card class="card-node">
    <template v-if="hasImage" #header>
      <Image class="pointer-events-none" :src="imageSrc" :alt="node.name" image-class="w-full h-auto" :preview="false" />
    </template>
    <template #title>
      <InlineEditableText :value="title" label="Card title" @commit="(text) => updateProperty('title', text)">
        <div class="card-title">{{ title }}</div>
      </InlineEditableText>
    </template>
    <template v-if="subtitle" #subtitle>
      <InlineEditableText :value="subtitle" label="Card subtitle" @commit="(text) => updateProperty('subtitle', text)">
        <div class="card-subtitle">{{ subtitle }}</div>
      </InlineEditableText>
    </template>
    <template #content>
      <InlineEditableText :value="content" multiline label="Card text" @commit="(text) => updateProperty('content', text)">
        <div class="card-content">{{ content }}</div>
      </InlineEditableText>
    </template>
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
