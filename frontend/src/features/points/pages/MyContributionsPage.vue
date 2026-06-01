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

  await store.fetchCategories()
  await store.fetchPoints(false, true)
  uiStore.filterMyPoints = true
  uiStore.statusFilter = 'all'
})
</script>

<template>
  <div :class="[
    'h-full w-full flex flex-col transition-[padding] duration-500 ease-in-out overflow-hidden',
    uiStore.isSidebarExpanded ? 'pl-[288px]' : 'pl-24',
    'pt-6 pb-6 pr-6'
  ]">
    <div class="flex-1 flex flex-col bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/40 shrink-0">
        <div class="flex items-center gap-2 bg-white/60 p-1 rounded-2xl border border-gray-100 shadow-sm">
          <button v-for="f in [
            { id: 'all', label: 'Semua' },
            { id: 'draft', label: 'Draft' },
            { id: 'pending', label: 'Menunggu' },
            { id: 'approved', label: 'Terverifikasi' },
            { id: 'rejected', label: 'Ditolak' }
          ]" :key="f.id" @click="uiStore.statusFilter = f.id as any" :class="[
            'px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300',
            uiStore.statusFilter === f.id
              ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          ]">
            {{ f.label }}
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-auto p-6 space-y-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="stat in [
            { label: 'Total Pengajuan', count: store.points.filter(p => p.owner_id === authStore.user?.id).length, color: 'primary' },
            { label: 'Disetujui', count: store.points.filter(p => p.owner_id === authStore.user?.id && p.status === 'approved').length, color: 'emerald-500' },
            { label: 'Menunggu', count: store.points.filter(p => p.owner_id === authStore.user?.id && p.status === 'pending').length, color: 'amber-500' },
            { label: 'Draf', count: store.points.filter(p => p.owner_id === authStore.user?.id && (p.status === 'draft' || !p.status)).length, color: 'gray-500' }
          ]" :key="stat.label" class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm group hover:border-primary/30 transition-all duration-300">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ stat.label }}</p>
            <p class="text-3xl font-black text-gray-900 mt-2 tracking-tighter">{{ stat.count }}</p>
          </div>
        </div>

        <PointTable :points="store.filteredPoints" :show-actions="true" :show-rejection-note="true" />
      </div>
    </div>
  </div>
</template>
