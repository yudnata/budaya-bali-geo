<script setup lang="ts">
import { onMounted } from 'vue'
import { usePointsStore } from '@/stores/pointsStore'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/auth'
import PointTable from '../components/PointTable.vue'

const store = usePointsStore()
const uiStore = useUIStore()
const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.fetchProfile()
  }

  if (authStore.isAdmin()) {
    uiStore.filterMyPoints = false
  } else {
    uiStore.filterMyPoints = true
  }
  uiStore.statusFilter = 'all'
  await store.fetchCategories()
  await store.fetchPoints()
})
</script>

<template>
  <div :class="[
    'h-full w-full flex flex-col transition-[padding] duration-500 ease-in-out overflow-hidden',
    uiStore.isSidebarExpanded ? 'pl-[288px]' : 'pl-24',
    'pt-24 pb-6 pr-6'
  ]">
    <div class="flex-1 flex flex-col bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
      <div class="flex-1 overflow-auto p-6">
        <PointTable :points="store.filteredPoints" :show-actions="true" />
      </div>
    </div>
  </div>
</template>
