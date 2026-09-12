<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import Image from 'primevue/image';
import type { Node } from '@/models/cloudboard';
import { useNodeProperty } from '@/composables/useNodeProperty';

const props = defineProps<{ node: Node }>();
const { getProperty } = useNodeProperty(() => props.node);

const url = computed(() => getProperty<string>('url', 'https://picsum.photos/300/200'));
const alt = computed(() => getProperty<string>('alt', ''));
const caption = computed(() => getProperty<string>('caption', ''));
</script>

<template>
  <Card :header="node.name" class="image-node">
    <Image :src="url" :alt="alt || node.name" image-class="w-full" :preview="true" />
    <div class="image-caption">
      {{ caption }}
    </div>
  </Card>
</template>

<style scoped>
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
