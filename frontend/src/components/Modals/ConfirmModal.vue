<script setup lang="ts">
import { ref } from 'vue'
import { usePointsStore } from '@/stores/pointsStore'

const store = usePointsStore()
const isLoading = ref(false)

const handleConfirm = async () => {
  if (isLoading.value) return

  isLoading.value = true
  try {
    await store.confirmState.onConfirm()
  } finally {
    isLoading.value = false
    store.cancelConfirm()
  }
}
</script>

<template>
  <div v-if="store.confirmState.isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center">
    <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="store.cancelConfirm"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-0">
      <div class="p-6 text-center">
        <div class="w-14 h-14 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-4 ring-8 ring-red-50/50">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 class="text-lg font-bold text-gray-900 mb-2">{{ store.confirmState.title }}</h3>
        <p class="text-sm text-gray-500 leading-relaxed">{{ store.confirmState.message }}</p>
      </div>
      <div class="flex border-t border-gray-100 bg-gray-50/50 p-4 gap-3">
        <button @click="store.cancelConfirm" :disabled="isLoading"
          class="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          Batal
        </button>
        <button @click="handleConfirm" :disabled="isLoading"
          class="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? 'Menghapus...' : 'Ya, Hapus' }}
        </button>
      </div>
    </div>
  </div>
</template>
