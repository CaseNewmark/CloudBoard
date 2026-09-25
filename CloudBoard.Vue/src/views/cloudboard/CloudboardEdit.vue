<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';
import type { CloudBoard } from '@/models/cloudboard';
import * as cloudboardService from '@/services/cloudboardService';

const props = defineProps<{ cloudBoard: CloudBoard | null }>();
const emit = defineEmits<{ boardUpdated: [board: CloudBoard]; editCancelled: [] }>();
const visible = defineModel<boolean>('visible', { default: false });

const toast = useToast();

const editingBoard = ref<CloudBoard | null>(null);
const shareEmail = ref('');
const sharedUsers = ref<string[]>([]);
const isSaving = ref(false);

watch([visible, () => props.cloudBoard], ([isVisible, cloudBoard]) => {
  if (isVisible && cloudBoard) {
    editingBoard.value = { ...cloudBoard, description: cloudBoard.description || '' };
    void loadSharedUsers(cloudBoard.id);
  } else if (!isVisible) {
    resetForm();
  }
});

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function saveEdit(): Promise<void> {
  if (!editingBoard.value || !editingBoard.value.name?.trim()) {
    toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Board name is required' });
    return;
  }

  isSaving.value = true;
  try {
    const updatedBoard = await cloudboardService.updateCloudBoard(editingBoard.value);
    await saveShareSettings(updatedBoard.id);

    toast.add({ severity: 'success', summary: 'Success', detail: 'Board updated successfully' });

    emit('boardUpdated', updatedBoard);
    closeDialog();
  } catch (error) {
    console.error('Error updating cloudboard', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update board' });
  } finally {
    isSaving.value = false;
  }
}

function cancelEdit(): void {
  emit('editCancelled');
  closeDialog();
}

function closeDialog(): void {
  visible.value = false;
  resetForm();
}

function resetForm(): void {
  editingBoard.value = null;
  shareEmail.value = '';
  sharedUsers.value = [];
  isSaving.value = false;
}

function addShareUser(): void {
  if (shareEmail.value && isValidEmail(shareEmail.value)) {
    if (!sharedUsers.value.includes(shareEmail.value)) {
      sharedUsers.value.push(shareEmail.value);
      shareEmail.value = '';
    } else {
      toast.add({ severity: 'warn', summary: 'Warning', detail: 'User is already in the share list' });
    }
  }
}

function removeShareUser(email: string): void {
  sharedUsers.value = sharedUsers.value.filter((user) => user !== email);
}

async function loadSharedUsers(boardId: string): Promise<void> {
  sharedUsers.value = await cloudboardService.getSharedUsers(boardId);
}

async function saveShareSettings(boardId: string): Promise<void> {
  await cloudboardService.updateSharing(boardId, sharedUsers.value);
}
</script>

<template>
  <Dialog
    header="Edit CloudBoard"
    v-model:visible="visible"
    modal
    closable
    :draggable="false"
    :resizable="false"
    class="w-96"
  >
    <div v-if="editingBoard" class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label for="boardName" class="font-semibold text-sm">Board Name</label>
        <input
          id="boardName"
          type="text"
          class="p-inputtext w-full"
          v-model="editingBoard.name"
          placeholder="Enter board name"
          :disabled="isSaving"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="boardDescription" class="font-semibold text-sm">Description</label>
        <Textarea
          id="boardDescription"
          v-model="editingBoard.description"
          placeholder="Enter board description (optional)"
          rows="3"
          class="w-full"
          :disabled="isSaving"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="font-semibold text-sm">Share with Users</label>
        <div class="flex gap-2">
          <InputText
            type="email"
            v-model="shareEmail"
            placeholder="Enter email address"
            class="flex-1"
            :disabled="isSaving"
          />
          <Button
            icon="pi pi-plus"
            @click="addShareUser"
            :disabled="!shareEmail || !isValidEmail(shareEmail) || isSaving"
            size="small"
          />
        </div>

        <div v-if="sharedUsers.length > 0" class="flex flex-col gap-1 mt-2">
          <span class="text-sm text-gray-600">Shared with:</span>
          <div v-for="user in sharedUsers" :key="user" class="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
            <span class="text-sm">{{ user }}</span>
            <i
              class="pi pi-times cursor-pointer text-red-600 hover:text-red-800"
              :class="{ 'pointer-events-none': isSaving, 'opacity-50': isSaving }"
              @click="removeShareUser(user)"
            ></i>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex items-center justify-center p-4">
      <ProgressSpinner stroke-width="4" animation-duration="1s" />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="cancelEdit" severity="secondary" :disabled="isSaving" />
      <Button
        label="Save"
        icon="pi pi-check"
        @click="saveEdit"
        :loading="isSaving"
        :disabled="!editingBoard || !editingBoard.name?.trim()"
      />
    </template>
  </Dialog>
</template>
