<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref(false);

async function run(): Promise<void> {
  try {
    const code = route.query['code'] as string | undefined;
    const authError = route.query['error'] as string | undefined;

    if (authError) {
      throw new Error(`Authentication error: ${authError}`);
    }

    if (code) {
      await authStore.handleCallback(code);

      if (authStore.isLoggedIn) {
        await router.push('/cloudboard');
      } else {
        throw new Error('Authentication failed - user not logged in after callback');
      }
    } else {
      throw new Error('No authorization code received');
    }
  } catch (err) {
    console.error('Auth callback error:', err);
    error.value = true;
    loading.value = false;

    setTimeout(() => {
      void router.push('/home');
    }, 3000);
  }
}

void run();
</script>

<template>
  <div class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <div v-if="loading && !error">
        <i class="pi pi-spin pi-spinner text-purple-600" style="font-size: 3rem"></i>
        <h2 class="mt-6 text-2xl font-bold text-gray-900">Signing you in...</h2>
        <p class="mt-2 text-gray-600">Please wait while we complete your authentication.</p>
      </div>

      <div v-if="error" class="text-center">
        <i class="pi pi-exclamation-triangle text-red-600" style="font-size: 3rem"></i>
        <h2 class="mt-6 text-2xl font-bold text-gray-900">Authentication Failed</h2>
        <p class="mt-2 text-gray-600">
          There was an issue signing you in. You will be redirected to the home page shortly.
        </p>
        <div class="mt-4">
          <button
            @click="router.push('/home')"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            Return to Home Now
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
