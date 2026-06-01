<script setup lang="ts">
import { usePointsStore } from '@/stores/pointsStore'

defineProps<{
  isEdit: boolean
  isSubmitting: boolean
  activeTab: 'data' | 'blog'
}>()

const emit = defineEmits(['submit', 'next', 'back'])
const store = usePointsStore()
</script>

<template>
  <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex items-center justify-end gap-3 rounded-b-2xl">

    <!-- Tab Data: Batal | Simpan Draft | Lanjut ke Blog → -->
    <template v-if="activeTab === 'data'">
      <button @click="store.closeModal()" :disabled="isSubmitting"
        class="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-gray-400 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-600 transition-all disabled:opacity-50 active:scale-95">
        Batal
      </button>
      <button @click="emit('submit', 'draft')" :disabled="isSubmitting"
        class="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-all active:scale-[0.98] disabled:opacity-50">
        {{ isSubmitting ? '...' : 'Simpan Draft' }}
      </button>
      <button @click="emit('next')" :disabled="isSubmitting"
        class="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-primary rounded-xl hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2">
        <svg v-if="isSubmitting" class="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ isSubmitting ? 'Menyimpan...' : 'Lanjut ke Blog' }}
        <svg v-if="!isSubmitting" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </template>

    <!-- Tab Blog: ← Kembali | Simpan Draft | Ajukan Verifikasi -->
    <template v-else>
      <button @click="emit('back')" :disabled="isSubmitting"
        class="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-gray-400 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-600 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Kembali
      </button>
      <button @click="emit('submit', 'draft')" :disabled="isSubmitting"
        class="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-all active:scale-[0.98] disabled:opacity-50">
        {{ isSubmitting ? '...' : 'Simpan Draft' }}
      </button>
      <button @click="emit('submit', 'pending')" :disabled="isSubmitting"
        class="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-primary rounded-xl hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2">
        <svg v-if="isSubmitting" class="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ isSubmitting ? 'Memproses...' : 'Ajukan Verifikasi' }}
      </button>
    </template>

  </div>
</template>
