<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import type { CloudBoard } from '@/models/cloudboard';
import * as cloudboardService from '@/services/cloudboardService';
import { useAuthStore } from '@/stores/auth';
import CloudboardEdit from './CloudboardEdit.vue';
import { importBoard, parseBoardExport } from '@/utils/boardExport';

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const authStore = useAuthStore();

/** Boards shared with the user can be opened and edited, but only the owner can rename, share or delete them. */
function isOwner(board: CloudBoard): boolean {
  return !board.createdBy || board.createdBy === authStore.currentUser?.id;
}

const availableBoards = ref<CloudBoard[]>([]);
const search = ref('');

const importInput = ref<HTMLInputElement>();
const importing = ref(false);
const MAX_IMPORT_BYTES = 100 * 1024 * 1024;

/** Creates a new board from a file saved with "Export as JSON". */
async function onImportFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;

  const data = file.size <= MAX_IMPORT_BYTES ? parseBoardExport(await file.text()) : undefined;
  if (!data) {
    toast.add({ severity: 'error', summary: 'Import failed', detail: `"${file.name}" isn't a CloudBoard export.`, life: 6000 });
    return;
  }

  importing.value = true;
  try {
    const boardId = await importBoard(data);
    toast.add({ severity: 'success', summary: 'Board imported', detail: `"${data.name}" was imported.`, life: 4000 });
    await router.push(`/cloudboard/${boardId}`);
  } catch (error) {
    console.error('Import failed', error);
    toast.add({ severity: 'error', summary: 'Import failed', detail: 'The board could not be imported completely.', life: 6000 });
    await refreshBoards();
  } finally {
    importing.value = false;
  }
}

/** Boards whose name or description contains every word typed, ignoring case. */
const filteredBoards = computed(() => {
  const terms = search.value.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return availableBoards.value;
  return availableBoards.value.filter((board) => {
    const text = `${board.name} ${board.description ?? ''}`.toLowerCase();
    return terms.every((term) => text.includes(term));
  });
});
const showEditDialog = ref(false);
const editingBoard = ref<CloudBoard | null>(null);

onMounted(refreshBoards);

async function refreshBoards(): Promise<void> {
  try {
    const boards = await cloudboardService.listCloudBoards();
    // Newest first; boards without a timestamp go last.
    availableBoards.value = boards.sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
  } catch (error) {
    console.error('Error fetching cloudboards', error);
  }
}

async function onCreate(): Promise<void> {
  const createCloudboardDocument: CloudBoard = {
    id: '',
    name: 'Empty Cloudboard',
    description: '',
    nodes: [],
    connections: [],
  };

  const cloudboard = await cloudboardService.createCloudBoard(createCloudboardDocument);
  await router.push(`/cloudboard/${cloudboard.id}`);
}

function onOpen(boardId: string): void {
  void router.push(`/cloudboard/${boardId}`);
}

function onEdit(board: CloudBoard, event: Event): void {
  event.stopPropagation();
  editingBoard.value = board;
  showEditDialog.value = true;
}

function onBoardUpdated(updatedBoard: CloudBoard): void {
  const index = availableBoards.value.findIndex((board) => board.id === updatedBoard.id);
  if (index !== -1) {
    availableBoards.value[index] = updatedBoard;
  }
}

function onEditDialogClosed(): void {
  editingBoard.value = null;
}

function onDelete(boardId: string, event: Event): void {
  event.stopPropagation();
  const deletionBoard = availableBoards.value.find((board) => board.id === boardId);

  confirm.require({
    target: event.target as HTMLElement,
    message: `Are you sure you want to delete "${deletionBoard?.name}?"`,
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { severity: 'danger' },
    accept: async () => {
      try {
        const success = await cloudboardService.deleteCloudBoard(boardId);
        if (success) {
          availableBoards.value = availableBoards.value.filter((board) => board.id !== boardId);
        }
      } catch (error) {
        console.error('Error deleting cloudboard', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete board' });
      }
    },
  });
}
</script>

<template>
  <div class="bg-amber-50 p-6 rounded-lg shadow-sm border border-gray-200 flex flex-row items-start gap-10">
    <div class="self-center w-full flex flex-col items-center gap-2">
    <button
      class="w-full h-64 p-4 flex flex-col items-center justify-center gap-3.5 hover:bg-amber-100 hover:border-amber-300"
      @click="onCreate"
    >
      <div class="flex flex-col items-center gap-3.5 mb-4">
        <i class="pi pi-plus text-gray-500" style="font-size: 2rem"></i>
        <h3 class="text-lg font-semibold text-gray-500">Create a new Cloudboard...</h3>
      </div>
    </button>
    <Button
      label="Import from file..."
      icon="pi pi-upload"
      text
      size="small"
      severity="secondary"
      :loading="importing"
      @click="importInput?.click()"
    />
    <input ref="importInput" type="file" accept=".json,application/json" class="hidden" aria-label="Import board file" @change="onImportFile" />
    </div>
    <div class="self-center">
      <span class="text-gray-600 mb-2">OR</span>
    </div>
    <div class="flex flex-col gap-2 w-full">
      <div class="flex items-center gap-3.5 mb-4 self-center">
        <i class="pi pi-folder text-gray-500" style="font-size: 2rem"></i>
        <h3 class="text-lg font-semibold text-gray-500">Open a Cloudboard...</h3>
      </div>
      <IconField class="w-sm">
        <InputIcon class="pi pi-search" />
        <InputText v-model="search" placeholder="Search boards" aria-label="Search boards" class="w-full" size="small" />
      </IconField>
      <div class="flex flex-col w-sm h-72 bg-white border-gray-300 border-1 rounded-sm p-2 gap-2 overflow-auto">
        <p v-if="availableBoards.length === 0" class="m-auto text-sm text-gray-500">No boards yet. Create one to get started.</p>
        <p v-else-if="filteredBoards.length === 0" class="m-auto text-sm text-gray-500">No boards match "{{ search.trim() }}".</p>
        <Button
          v-for="board in filteredBoards"
          :key="board.id"
          text
          severity="secondary"
          @click="onOpen(board.id)"
          class="w-full shrink-0 justify-stretch! gap-2 items-center flex"
        >
          <i class="pi" :class="isOwner(board) ? 'pi-file' : 'pi-users'" :title="isOwner(board) ? undefined : 'Shared with you'"></i>
          <span class="grow flex flex-col text-left min-w-0">
            <span class="truncate">{{ board.name }}</span>
            <span v-if="board.description" class="truncate text-xs text-gray-500" :title="board.description">
              {{ board.description }}
            </span>
          </span>
          <template v-if="isOwner(board)">
            <i class="pi pi-pencil z-10" @click="onEdit(board, $event)" title="Edit board"></i>
            <i class="pi pi-trash z-10" @click="onDelete(board.id, $event)" title="Delete board"></i>
          </template>
        </Button>
      </div>
    </div>
  </div>

  <CloudboardEdit
    v-model:visible="showEditDialog"
    :cloud-board="editingBoard"
    @board-updated="onBoardUpdated"
    @edit-cancelled="() => {}"
    @update:visible="onEditDialogClosed"
  />
</template>
