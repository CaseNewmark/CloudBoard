<script setup lang="ts">
import { ref, watch } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const route = useRoute();

// Below the sm breakpoint the nav links and account actions move into a toggleable menu.
const mobileMenuOpen = ref(false);
watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false;
  },
);

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
          <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              :aria-expanded="mobileMenuOpen"
              aria-controls="mobile-menu"
              :aria-label="mobileMenuOpen ? 'Close main menu' : 'Open main menu'"
              @click="mobileMenuOpen = !mobileMenuOpen"
            >
              <i class="pi" :class="mobileMenuOpen ? 'pi-times' : 'pi-bars'" style="font-size: 1.25rem"></i>
            </button>
          </div>
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
                </template>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <template v-if="authStore.isLoggedIn">
              <span class="hidden sm:inline text-sm text-gray-600"> Welcome, {{ authStore.displayName }} </span>
              <button
                @click="logout"
                class="hidden sm:inline-block rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-500 hover:text-white"
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

      <div v-if="mobileMenuOpen" id="mobile-menu" class="sm:hidden border-t border-gray-200">
        <div class="space-y-1 px-2 pt-2 pb-3">
          <RouterLink
            to="/home"
            class="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100"
            :class="{ 'bg-gray-700 text-white hover:bg-gray-700': isActive('/home') }"
            >Home</RouterLink
          >
          <RouterLink
            v-if="authStore.isLoggedIn"
            to="/cloudboard"
            class="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100"
            :class="{ 'bg-gray-700 text-white hover:bg-gray-700': isActive('/cloudboard') }"
            >Cloudboard</RouterLink
          >
        </div>
        <div v-if="authStore.isLoggedIn" class="border-t border-gray-200 px-2 pt-3 pb-3">
          <div class="px-3 pb-2 text-sm text-gray-600">Signed in as {{ authStore.displayName }}</div>
          <button
            class="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-600 hover:bg-gray-100"
            @click="logout"
          >
            <i class="pi pi-sign-out mr-1"></i>
            Logout
          </button>
        </div>
      </div>
    </nav>
    <RouterView />
  </div>
</template>
