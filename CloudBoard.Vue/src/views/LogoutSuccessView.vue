<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

toast.add({
  severity: 'success',
  summary: 'Logout Successful',
  detail: 'You have been successfully logged out',
  life: 3000,
});

setTimeout(() => {
  void router.push('/home');
}, 2000);
</script>

<template>
  <div class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <div>
        <i class="pi pi-check-circle text-green-600" style="font-size: 4rem"></i>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Logged Out Successfully</h2>
        <p class="mt-2 text-gray-600">You have been successfully logged out. Redirecting to home...</p>
      </div>
    </div>
  </div>
</template>
