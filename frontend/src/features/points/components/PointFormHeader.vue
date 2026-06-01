<script setup lang="ts">
import { usePointsStore } from '@/stores/pointsStore'

defineProps<{
  isEdit: boolean
  activeTab: 'data' | 'blog'
}>()

const store = usePointsStore()
</script>

<template>
  <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
    <div>
      <h3 class="text-lg font-black text-gray-800 tracking-tight">
        <template v-if="activeTab === 'blog'">Update Blog Objek</template>
        <template v-else>{{ isEdit ? 'Update Data Objek' : 'Registrasi Objek Baru' }}</template>
      </h3>

      <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Geo Information System</p>
    </div>
    <button @click="store.closeModal()" class="text-gray-400 hover:text-red-500 transition-all p-2 rounded-xl hover:bg-red-50 active:scale-90">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
