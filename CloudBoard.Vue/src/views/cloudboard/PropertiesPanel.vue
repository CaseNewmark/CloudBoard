<script setup lang="ts">
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Inplace from 'primevue/inplace';
import ColorPicker from 'primevue/colorpicker';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';
import { type LinkProperties, type Node, NodeType } from '@/models/cloudboard';
import * as nodeService from '@/services/nodeService';

const visible = defineModel<boolean>('visible', { default: false });
const nodeProperties = defineModel<Node | undefined>('nodeProperties', { default: undefined });

const nodeTypes = Object.values(NodeType);
const nodeTypeLabels: Record<NodeType, string> = {
  [NodeType.Note]: 'Simple Note',
  [NodeType.Card]: 'Card',
  [NodeType.LinkCollection]: 'Link Collection',
  [NodeType.ImageNode]: 'Image',
  [NodeType.CodeBlock]: 'Code Block',
};

const languageOptions = [
  { name: 'JavaScript', value: 'javascript' },
  { name: 'TypeScript', value: 'typescript' },
  { name: 'HTML', value: 'html' },
  { name: 'CSS', value: 'css' },
  { name: 'Python', value: 'python' },
  { name: 'Java', value: 'java' },
  { name: 'C#', value: 'csharp' },
  { name: 'JSON', value: 'json' },
];

function getNodeTypeLabel(type: NodeType): string {
  return nodeTypeLabels[type] || 'Unknown Type';
}

function changeNodeType(newType: NodeType): void {
  const node = nodeProperties.value;
  if (!node) return;

  const { id, name, position, connectors } = node;

  node.type = newType;
  node.properties = nodeService.getDefaultPropertiesForType(newType);

  node.id = id;
  node.name = name;
  node.position = position;
  node.connectors = connectors;

  void nodeService.updateNode(id, node);
}

function addLink(): void {
  const node = nodeProperties.value;
  if (!node || node.type !== NodeType.LinkCollection) return;

  const links: LinkProperties[] = node.properties['links'] || [];
  links.push({ title: 'New Link', url: 'https://example.com', iconClass: 'pi pi-external-link' });
  node.properties['links'] = links;

  void nodeService.updateNode(node.id, node);
}

function removeLink(index: number): void {
  const node = nodeProperties.value;
  if (!node || node.type !== NodeType.LinkCollection) return;

  const links: LinkProperties[] = node.properties['links'] || [];
  links.splice(index, 1);
  node.properties['links'] = links;

  void nodeService.updateNode(node.id, node);
}

function updateNodeName(name: string): void {
  const node = nodeProperties.value;
  if (!node || !name) return;

  node.name = name;
  void nodeService.updateNode(node.id, node);
}

function updateProperty(): void {
  const node = nodeProperties.value;
  if (!node) return;
  void nodeService.updateNode(node.id, node);
}
</script>

<template>
  <div
    class="sidepanel shadow-md bg-white h-full w-70 z-30 transition-all duration-200 ease-in-out"
    :class="visible ? 'open' : 'close'"
  >
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <Inplace class="w-full">
          <template #display>
            <h3 class="w-full text-xl truncate font-bold">{{ nodeProperties?.name }}</h3>
          </template>
          <template #content="{ closeCallback }">
            <input
              v-if="nodeProperties"
              type="text"
              class="p-inputtext"
              autofocus
              v-blur-on-enter
              v-model="nodeProperties.name"
              placeholder="Enter name"
              @blur="
                updateNodeName(nodeProperties!.name);
                closeCallback();
              "
            />
          </template>
        </Inplace>
        <Button text severity="contrast" class="toggle-btn" @click="visible = !visible">
          <i class="pi" :class="visible ? 'pi-chevron-right' : 'pi-chevron-left'"></i>
        </Button>
      </div>

      <div v-if="nodeProperties" class="properties-content">
        <!-- Node Type Selector -->
        <div class="field mb-4">
          <label class="block mb-1 font-medium">Node Type</label>
          <Select
            :options="nodeTypes"
            v-model="nodeProperties.type"
            class="w-full"
            @change="changeNodeType(nodeProperties.type)"
          >
            <template #value="{ value }">
              <div class="flex align-items-center gap-2">
                <span>{{ getNodeTypeLabel(value) }}</span>
              </div>
            </template>
            <template #option="{ option }">
              <div class="flex align-items-center gap-2">
                <span>{{ getNodeTypeLabel(option) }}</span>
              </div>
            </template>
          </Select>
        </div>

        <!-- Dynamic properties based on node type -->
        <div v-if="nodeProperties.type === NodeType.Note" class="node-properties">
          <div class="field mb-3">
            <label class="block mb-1 font-medium">Content</label>
            <Textarea
              v-model="nodeProperties.properties['content']"
              auto-resize
              rows="5"
              class="w-full"
              @update:model-value="updateProperty"
            />
          </div>
          <div class="field mb-3">
            <label class="block mb-1 font-medium">Background Color</label>
            <ColorPicker
              v-model="nodeProperties.properties['backgroundColor']"
              default-color="#f8f9fa"
              @update:model-value="updateProperty"
            />
          </div>
          <div class="field mb-3">
            <label class="block mb-1 font-medium">Text Color</label>
            <ColorPicker
              v-model="nodeProperties.properties['textColor']"
              default-color="#212529"
              @update:model-value="updateProperty"
            />
          </div>
        </div>

        <div v-else-if="nodeProperties.type === NodeType.Card" class="node-properties">
          <div class="field mb-3">
            <label class="block mb-1 font-medium">Title</label>
            <InputText v-model="nodeProperties.properties['title']" class="w-full" @update:model-value="updateProperty" />
          </div>
          <div class="field mb-3">
            <label class="block mb-1 font-medium">Subtitle</label>
            <InputText
              v-model="nodeProperties.properties['subtitle']"
              class="w-full"
              @update:model-value="updateProperty"
            />
          </div>
          <div class="field mb-3">
            <label class="block mb-1 font-medium">Image URL</label>
            <InputText
              v-model="nodeProperties.properties['imageUrl']"
              class="w-full"
              @update:model-value="updateProperty"
            />
          </div>
          <div class="field mb-3">
            <label class="block mb-1 font-medium">Content</label>
            <Textarea
              v-model="nodeProperties.properties['content']"
              auto-resize
              rows="5"
              class="w-full"
              @update:model-value="updateProperty"
            />
          </div>
        </div>

        <div v-else-if="nodeProperties.type === NodeType.LinkCollection" class="node-properties">
          <div class="field mb-2 flex justify-between items-center">
            <label class="font-medium">Links</label>
            <Button icon="pi pi-plus" size="small" @click="addLink" />
          </div>

          <div
            v-for="(link, index) in (nodeProperties.properties['links'] as LinkProperties[])"
            :key="index"
            class="mb-4 p-3 border rounded shadow-sm"
          >
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-bold">Link No. #{{ index }}</span>
              <Button icon="pi pi-trash" size="small" severity="danger" @click="removeLink(index)" />
            </div>

            <div class="field mb-2">
              <label class="block mb-1 text-sm">Title</label>
              <InputText v-model="link.title" class="w-full" @update:model-value="updateProperty" />
            </div>
            <div class="field mb-2">
              <label class="block mb-1 text-sm">URL</label>
              <InputText v-model="link.url" class="w-full" @update:model-value="updateProperty" />
            </div>
            <div class="field mb-2">
              <label class="block mb-1 text-sm">Icon Class</label>
              <InputText v-model="link.iconClass" class="w-full" @update:model-value="updateProperty" />
            </div>
          </div>
        </div>

        <div v-else-if="nodeProperties.type === NodeType.ImageNode" class="node-properties">
          <div class="field mb-3">
            <label class="block mb-1 font-medium">Image URL</label>
            <InputText v-model="nodeProperties.properties['url']" class="w-full" @update:model-value="updateProperty" />
          </div>
          <div class="field mb-3">
            <label class="block mb-1 font-medium">Alt Text</label>
            <InputText v-model="nodeProperties.properties['alt']" class="w-full" @update:model-value="updateProperty" />
          </div>
          <div class="field mb-3">
            <label class="block mb-1 font-medium">Caption</label>
            <InputText
              v-model="nodeProperties.properties['caption']"
              class="w-full"
              @update:model-value="updateProperty"
            />
          </div>
        </div>

        <div v-else-if="nodeProperties.type === NodeType.CodeBlock" class="node-properties">
          <div class="field mb-3">
            <label class="block mb-1 font-medium">Language</label>
            <Select
              :options="languageOptions"
              v-model="nodeProperties.properties['language']"
              option-label="name"
              option-value="value"
              class="w-full"
              @update:model-value="updateProperty"
            />
          </div>
          <div class="field mb-3">
            <label class="block mb-1 font-medium">Show Line Numbers</label>
            <ToggleSwitch v-model="nodeProperties.properties['showLineNumbers']" @update:model-value="updateProperty" />
          </div>
          <div class="field mb-3">
            <label class="block mb-1 font-medium">Code</label>
            <Textarea
              v-model="nodeProperties.properties['code']"
              auto-resize
              rows="8"
              class="w-full font-mono text-sm"
              @update:model-value="updateProperty"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidepanel {
  --panel-open-width: 17.5rem;
  transform: translateX(100%);
}

.open {
  width: var(--panel-open-width);
  transform: translateX(0);
}

.close {
  width: 0;
  transform: translateX(100%);
}
</style>
