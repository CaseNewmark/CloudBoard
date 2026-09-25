<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const route = useRoute();

function isActive(path: string): boolean {
  return route.path.startsWith(path);
}

function login(): void {
  void authStore.login();
}

function logout(): void {
  authStore.logout();
}
</script>

<template>
  <Toast />
  <ConfirmDialog :style="{ width: '450px' }" />
  <div class="h-lvh flex flex-col">
    <nav class="bg-white border-b-1 border-gray-200 shadow-md z-40">
      <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div class="relative flex h-16 items-center justify-between">
          <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div class="flex shrink-0 items-center">
              <i class="pi pi-clipboard text-purple-800" style="font-size: 2rem"></i>
            </div>
            <div class="hidden sm:ml-6 sm:block">
              <div class="flex space-x-4">
                <RouterLink
                  to="/home"
                  class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-500 hover:text-white"
                  :class="{ 'bg-gray-700 text-white': isActive('/home') }"
                  >Home</RouterLink
                >
                <template v-if="authStore.isLoggedIn">
                  <RouterLink
                    to="/cloudboard"
                    class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-500 hover:text-white"
                    :class="{ 'bg-gray-700 text-white': isActive('/cloudboard') }"
                    >Cloudboard</RouterLink
                  >
                  <RouterLink
                    to="/projects"
                    class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-500 hover:text-white"
                    :class="{ 'bg-gray-700 text-white': isActive('/projects') }"
                    >Projects</RouterLink
                  >
                  <RouterLink
                    to="/timeline"
                    class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-500 hover:text-white"
                    :class="{ 'bg-gray-700 text-white': isActive('/timeline') }"
                    >Timeline</RouterLink
                  >
                </template>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <template v-if="authStore.isLoggedIn">
              <span class="text-sm text-gray-600"> Welcome, {{ authStore.displayName }} </span>
              <button
                @click="logout"
                class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-500 hover:text-white"
              >
                <i class="pi pi-sign-out mr-1"></i>
                Logout
              </button>
            </template>
            <button
              v-else
              @click="login"
              class="rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-500"
            >
              <i class="pi pi-sign-in mr-1"></i>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
    <RouterView />
  </div>
</template>
