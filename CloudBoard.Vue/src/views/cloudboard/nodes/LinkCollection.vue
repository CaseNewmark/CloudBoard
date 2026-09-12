<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import type { LinkProperties, Node } from '@/models/cloudboard';
import { useNodeProperty } from '@/composables/useNodeProperty';

const props = defineProps<{ node: Node }>();
const { getProperty } = useNodeProperty(() => props.node);

const links = computed(() => getProperty<LinkProperties[]>('links', []));

function openLink(url: string, event: MouseEvent): void {
  event.preventDefault();
  event.stopPropagation();
  window.open(url, '_blank');
}
</script>

<template>
  <Card :header="node.name" class="link-collection-card">
    <div class="link-collection">
      <div v-for="(link, index) in links" :key="index" class="link-item">
        <a href="javascript:void(0)" class="link-button" @click="openLink(link.url, $event)">
          <i :class="[link.iconClass || 'pi pi-link', 'link-icon']"></i>
          <span class="text-xs text-gray-500">{{ index }}</span>
          <span class="link-title">{{ link.title }}</span>
        </a>
      </div>
      <div v-if="links.length === 0" class="text-center p-3 text-gray-500">
        <i class="pi pi-info-circle mb-2" style="font-size: 1.5rem"></i>
        <p>No links added yet</p>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.link-collection-card {
  min-width: 250px;
  max-width: 350px;
}

.link-collection {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 5px 0;
}

.link-item {
  display: flex;
}

.link-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  text-decoration: none;
  color: #0077cc;
  transition: all 0.2s ease;
  width: 100%;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.link-button:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #c0c0c0;
}

.link-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.link-icon {
  font-size: 1.2rem;
  color: #6c757d;
}

.link-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.link-button:hover .link-title {
  color: #005fa3;
}

.link-button:hover .link-icon {
  color: #005fa3;
}
</style>
