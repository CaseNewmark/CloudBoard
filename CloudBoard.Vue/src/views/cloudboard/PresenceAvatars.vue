<script setup lang="ts">
import type { PresenceUser } from '@/composables/useBoardRealtime';

defineProps<{ users: PresenceUser[] }>();

const MAX_SHOWN = 5;
const palette = ['#2563eb', '#16a34a', '#d97706', '#db2777', '#7c3aed', '#0891b2', '#dc2626', '#4d7c0f'];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
  return letters.toUpperCase();
}

function colorFor(userId: string): string {
  let hash = 0;
  for (const char of userId) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return palette[Math.abs(hash) % palette.length];
}
</script>

<template>
  <div v-if="users.length" class="presence" :aria-label="`${users.length} other ${users.length === 1 ? 'person' : 'people'} viewing`">
    <span
      v-for="user in users.slice(0, MAX_SHOWN)"
      :key="user.userId"
      class="avatar"
      :style="{ backgroundColor: colorFor(user.userId) }"
      :title="`${user.name} is viewing this board`"
    >
      {{ initials(user.name) }}
    </span>
    <span v-if="users.length > MAX_SHOWN" class="avatar more" :title="users.slice(MAX_SHOWN).map((u) => u.name).join(', ')">
      +{{ users.length - MAX_SHOWN }}
    </span>
  </div>
</template>

<style scoped>
.presence {
  position: fixed;
  top: 5.5rem;
  right: 2rem;
  z-index: 20;
  display: flex;
  flex-direction: row-reverse;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  margin-left: -0.5rem;
  border-radius: 9999px;
  border: 2px solid white;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  cursor: default;
}

.avatar.more {
  background-color: #6b7280;
}
</style>
