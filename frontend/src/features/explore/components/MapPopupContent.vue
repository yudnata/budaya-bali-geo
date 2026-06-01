<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePointsStore } from '@/stores/pointsStore'
import { useUIStore } from '@/stores/uiStore'
import type { GeoPoint } from '@/types/pointTypes'

const props = defineProps<{
  point: GeoPoint
  typeName: string
}>()

const authStore = useAuthStore()
const store = usePointsStore()
const uiStore = useUIStore()

const getCategoryIcon = () => {
  const iconName = store.objectTypes.find(t => t.id === props.point.category_id)?.icon || ''

  const icons: Record<string, string> = {
    'temple': 'M12 2l-4 3h8l-4-3zm0 4l-6 4h12l-6-4zm0 5l-8 6h16l-8-6zm-2 6h4v5h-4z',
    'waterfall': 'M12 2v16M9 6c-2 0-3 1-3 3v13M15 6c2 0 3 1 3 3v13M12 22v-2',
    'beach': 'M12 10a4 4 0 100-8 4 4 0 000 8z M2 17c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1 M2 21c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1',
    'mountain': 'M3 20l9-16 9 16H3z M8 11l4-3 4 3',
    'hill': 'M2 20c4-6 10-6 14 0 M12 20c4-4 8-4 10 0',
    'lake': 'M12 21c-5 0-9-2-9-5s4-5 9-5 9 2 9 5-4 5-9 5z M12 17a3 3 0 110-6 3 3 0 010 6z',
    'forest': 'M12 2l3 5H9l3-5zm0 6l4 7H8l4-7zm0 7v5',
    'village': 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
    'museum': 'M4 22V10h16v12M2 10l10-8 10 8M9 14v4M15 14v4',
    'market': 'M3 3h18v2H3V3zm3 4v14h12V7H6zM10 7v14M14 7v14'
  }

  return icons[iconName] || 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z'
}

const handleEdit = () => {
  store.openModal(props.point)
}

const handleDelete = () => {
  store.requestConfirm(
    'Hapus Objek Budaya?',
    `Apakah Anda yakin ingin menghapus data situs "${props.point.name}" secara permanen?`,
    async () => {
      if (props.point.id) {
        await store.deletePoint(props.point.id)
      }
    }
  )
}
</script>

<template>
  <div class="p-0 font-sans flex flex-col h-full bg-white ">
    <div v-if="point.cover_image" class="h-48 w-full bg-slate-100 relative">
      <img :src="point.cover_image" class="w-full h-full object-cover">

      <!-- Status Badge Overlay -->
      <div class="absolute top-4 left-6 z-10 flex gap-2">
        <span v-if="point.status === 'draft'"
          class="bg-slate-900/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border border-white/20">Draft</span>
        <span v-if="point.status === 'pending'" class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-full shadow-lg">Pending</span>
        <span v-if="point.status === 'approved'" class="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-full shadow-lg">Approved</span>
      </div>

      <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
      <h4 class="absolute bottom-5 left-6 right-6 font-black text-white text-2xl leading-tight drop-shadow-lg">{{ point.name }}</h4>
    </div>

    <div class="p-6 flex-1 flex flex-col">
      <div v-if="!point.cover_image" class="flex items-center justify-between gap-4 mb-5">
        <h4 class="font-black text-slate-900 text-2xl">{{ point.name }}</h4>
        <div class="shrink-0">
          <span v-if="point.status === 'draft'" class="bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-slate-200">Draft</span>
          <span v-if="point.status === 'pending'" class="bg-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-amber-200">Pending</span>
          <span v-if="point.status === 'approved'"
            class="bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-emerald-200">Approved</span>
        </div>
      </div>

      <div class="space-y-4 text-sm text-slate-600 mb-6">
        <div class="flex items-start gap-4">
          <div class="w-6 h-6 text-amber-500 flex items-center justify-center shrink-0 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-full h-full">
              <path stroke-linecap="round" stroke-linejoin="round" :d="getCategoryIcon()" />
            </svg>
          </div>
          <div class="pt-1">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Kategori</p>
            <p class="font-bold text-slate-800">{{ typeName }}</p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="w-6 h-6 text-emerald-500 flex items-center justify-center shrink-0 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-full h-full">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <div class="pt-1">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Lokasi Budaya</p>
            <p class="font-medium text-slate-700 leading-snug">{{ point.address || 'Alamat tidak tersedia' }}</p>
          </div>
        </div>
      </div>

      <div class="mt-auto pt-5 border-t border-slate-100">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm overflow-hidden shadow-inner border border-slate-100">
              <img v-if="point.owner_avatar" :src="point.owner_avatar" class="w-full h-full object-cover">
              <span v-else>{{ point.owner_name?.charAt(0) || 'S' }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-0.5">Kontributor</span>
              <span class="text-sm font-bold text-slate-800 leading-none">{{ point.owner_name || 'Sistem' }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2.5">
          <RouterLink :to="`/blog/${point.id}`"
            class="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2">
            Baca Blog Selengkapnya
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </RouterLink>

          <div v-if="authStore.isAuthenticated() && uiStore.isEditMode && point.owner_id === authStore.user?.id" class="flex gap-2 mt-1">
            <button @click="handleEdit" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-colors">
              Edit
            </button>
            <button @click="handleDelete" class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-colors">
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
