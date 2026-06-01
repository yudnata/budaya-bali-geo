<script setup lang="ts">
import { usePointsStore } from '@/stores/pointsStore'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { GeoPoint } from '@/types/pointTypes'

defineProps<{
  points: GeoPoint[]
  showActions?: boolean
  showRejectionNote?: boolean
}>()

const store = usePointsStore()
const authStore = useAuthStore()
const router = useRouter()

const getTypeName = (categoryId: number) => {
  return store.objectTypes.find(t => t.id === categoryId)?.name || 'Kategori'
}

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'approved': return { label: 'Terverifikasi', class: 'text-emerald-700 bg-emerald-50 border-emerald-100', dot: 'bg-emerald-500' }
    case 'pending': return { label: 'Menunggu', class: 'text-amber-700 bg-amber-50 border-amber-100', dot: 'bg-amber-500' }
    case 'rejected': return { label: 'Ditolak', class: 'text-rose-700 bg-rose-50 border-rose-100', dot: 'bg-rose-500' }
    case 'draft': return { label: 'Draft', class: 'text-slate-600 bg-slate-50 border-slate-100', dot: 'bg-slate-400' }
    default: return { label: 'Draft', class: 'text-slate-600 bg-slate-50 border-slate-100', dot: 'bg-slate-400' }
  }
}

const handleDelete = (point: GeoPoint) => {
  store.requestConfirm(
    'Hapus Data?',
    `Apakah Anda yakin ingin menghapus data situs "${point.name}" secara permanen?`,
    async () => {
      if (point.id) {
        await store.deletePoint(point.id)
      }
    }
  )
}
</script>

<template>
  <div class="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden flex flex-col">
    <table class="w-full text-left border-collapse min-w-max">
      <thead class="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100">
        <tr>
          <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Objek</th>
          <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategori</th>
          <th v-if="authStore.isAdmin()" class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kontributor</th>
          <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
          <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Update</th>
          <th v-if="showActions" class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr v-for="point in points" :key="point.id" class="hover:bg-blue-50/40 transition-colors group">
          <td class="px-6 py-5">
            <div class="font-black text-gray-900 text-sm tracking-tight group-hover:text-primary transition-colors">{{ point.name }}</div>
            <div class="text-[10px] text-gray-400 font-bold tracking-tighter mt-1 line-clamp-1 max-w-[250px]" :title="point.address">
              {{ point.address || 'Alamat belum diisi' }}
            </div>
          </td>
          <td class="px-6 py-5">
            <span class="text-[10px] font-black text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-sm">
              {{ getTypeName(point.category_id || 0) }}
            </span>
          </td>
          <td v-if="authStore.isAdmin()" class="px-6 py-5">
            <div class="font-bold text-gray-900 text-xs tracking-tight">{{ point.owner_name || 'Anonim' }}</div>
            <div class="text-[10px] text-gray-400 font-medium tracking-tight">{{ point.owner_email || '-' }}</div>
          </td>
          <td class="px-6 py-5">
            <div :class="['inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest', getStatusBadge(point.status).class]">
              <span :class="['w-1.5 h-1.5 rounded-full animate-pulse', getStatusBadge(point.status).dot]"></span>
              {{ getStatusBadge(point.status).label }}
            </div>
            <p v-if="showRejectionNote && point.status === 'rejected' && point.rejection_note" class="text-[10px] text-rose-500 mt-2 font-bold italic max-w-[200px] leading-relaxed">
              Ket: {{ point.rejection_note }}
            </p>
          </td>
          <td class="px-6 py-5 text-xs text-gray-500 font-bold uppercase tracking-tighter">
            {{ new Date(point.updated_at || '').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) }}
          </td>
          <td v-if="showActions" class="px-6 py-5 text-center">
            <div class="flex items-center justify-center gap-2">
              <button v-if="point.owner_id === authStore.user?.id || authStore.isAdmin()" @click="store.openModal(point)"
                class="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all text-primary bg-primary/10 hover:bg-primary/20">
                Edit
              </button>
              <button v-if="point.owner_id === authStore.user?.id || authStore.isAdmin()" @click="handleDelete(point)"
                class="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all text-rose-600 bg-rose-50 hover:bg-rose-100">
                Hapus
              </button>
              <button @click="router.push(`/blog/${point.id}`)"
                class="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all text-white bg-primary hover:bg-emerald-600 shadow-md shadow-primary/20">
                Baca
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="points.length === 0">
          <td :colspan="(showActions ? 5 : 4) + (authStore.isAdmin() ? 1 : 0)" class="px-6 py-20 text-center text-gray-400 text-sm italic font-medium">
            Tidak ada data tersedia.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
