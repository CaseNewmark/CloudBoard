<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import type { CloudBoard } from '@/models/cloudboard';
import * as cloudboardService from '@/services/cloudboardService';
import CloudboardEdit from './CloudboardEdit.vue';

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

const availableBoards = ref<CloudBoard[]>([]);
const showEditDialog = ref(false);
const editingBoard = ref<CloudBoard | null>(null);

onMounted(refreshBoards);

async function refreshBoards(): Promise<void> {
  try {
    const boards = await cloudboardService.listCloudBoards();
    availableBoards.value = boards.sort((a, b) => {
      if (a?.createdAt && b?.createdAt) {
        return a.createdAt < b.createdAt ? -1 : 1;
      }
      return 0;
    });
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
    <button
      class="self-center w-full h-64 p-4 flex flex-col items-center justify-center gap-3.5 hover:bg-amber-100 hover:border-amber-300"
      @click="onCreate"
    >
      <div class="flex flex-col items-center gap-3.5 mb-4">
        <i class="pi pi-plus text-gray-500" style="font-size: 2rem"></i>
        <h3 class="text-lg font-semibold text-gray-500">Create a new Cloudboard...</h3>
      </div>
    </button>
    <div class="self-center">
      <span class="text-gray-600 mb-2">OR</span>
    </div>
    <div class="flex flex-col gap-2 w-full">
      <div class="flex items-center gap-3.5 mb-4 self-center">
        <i class="pi pi-folder text-gray-500" style="font-size: 2rem"></i>
        <h3 class="text-lg font-semibold text-gray-500">Open a Cloudboard...</h3>
      </div>
      <div class="flex flex-col w-sm h-72 bg-white border-gray-300 border-1 rounded-sm p-2 gap-2 overflow-auto">
        <Button
          v-for="board in availableBoards"
          :key="board.id"
          text
          severity="secondary"
          @click="onOpen(board.id)"
          class="w-full justify-stretch! gap-2 items-center flex"
        >
          <i class="pi pi-file"></i>
          <span class="grow text-left truncate">{{ board.name }}</span>
          <i class="pi pi-pencil z-10" @click="onEdit(board, $event)" title="Edit board"></i>
          <i class="pi pi-trash z-10" @click="onDelete(board.id, $event)" title="Delete board"></i>
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
