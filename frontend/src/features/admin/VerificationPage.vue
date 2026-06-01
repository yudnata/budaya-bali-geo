<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { usePointsStore } from '@/stores/pointsStore'
import { useUIStore } from '@/stores/uiStore'
import { useNotificationStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'
import type { GeoPoint } from '@/types/pointTypes'

const store = usePointsStore()
const uiStore = useUIStore()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

const pendingPoints = ref<GeoPoint[]>([])
const isLoading = ref(false)

const selectedPoint = ref<GeoPoint | null>(null)
const blogData = ref<{ title: string; content: string; cover_photo: string } | null>(null)
const isPreviewOpen = ref(false)
const showRejectModal = ref(false)
const rejectionNote = ref('')
const isProcessing = ref(false)

watch(isPreviewOpen, (newVal) => {
  uiStore.isReviewModalOpen = newVal
})

const fetchPending = async () => {
  isLoading.value = true
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/points/pending`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    const json = await res.json()
    if (json.success) {
      pendingPoints.value = json.data
    }
  } catch {
    notificationStore.error('Gagal mengambil data pengajuan')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await store.fetchCategories()
  await fetchPending()
})

const openPreview = async (point: GeoPoint) => {
  selectedPoint.value = point
  isPreviewOpen.value = true
  if (point.id) {
    const blog = await store.getBlog(point.id)
    if (blog) {
      blogData.value = { title: blog.title, content: blog.content, cover_photo: blog.cover_photo || '' }
    } else {
      blogData.value = null
    }
  }
}

const verifyPoint = async (status: 'approved' | 'rejected') => {
  if (!selectedPoint.value) return

  isProcessing.value = true
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/points/${selectedPoint.value.id}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        status,
        rejection_note: status === 'rejected' ? rejectionNote.value : ''
      }),
    })
    const json = await res.json()
    if (json.success) {
      notificationStore.success(`Berhasil memverifikasi: ${status}`)
      isPreviewOpen.value = false
      showRejectModal.value = false
      rejectionNote.value = ''
      fetchPending()
    } else {
      notificationStore.error(json.message)
    }
  } catch {
    notificationStore.error('Gagal memproses verifikasi')
  } finally {
    isProcessing.value = false
  }
}

const getCategoryName = (id?: number) => {
  return store.objectTypes.find(t => t.id === id)?.name || 'Kategori'
}

import { getIconPath } from '@/constants/icons'
</script>

<template>
  <div :class="[
    'h-full w-full flex flex-col transition-[padding] duration-500 ease-in-out overflow-hidden',
    uiStore.isSidebarExpanded ? 'pl-[288px]' : 'pl-24',
    'pt-6 pb-6 pr-6'
  ]">
    <div class="flex-1 flex flex-col bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/40 shrink-0">
        <div>
          <h2 class="text-xl font-extrabold text-gray-900 tracking-tight">Panel Verifikasi Budaya Bali</h2>
          <p class="text-xs text-gray-500 mt-1 font-medium">Tinjau pengajuan dari kontributor sebelum ditayangkan.</p>
        </div>
        <div class="bg-amber-50 px-4 py-1.5 rounded-xl border border-amber-200">
          <span class="text-amber-600 font-black text-[10px] uppercase tracking-widest">{{ pendingPoints.length }} Menunggu Verifikasi</span>
        </div>
      </div>

      <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center text-gray-400">
        <div class="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
        <p class="text-sm font-bold">Memuat pengajuan...</p>
      </div>

      <div v-else-if="pendingPoints.length === 0" class="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <h3 class="text-gray-900 font-black text-lg">Semua Bersih!</h3>
        <p class="text-gray-500 text-sm mt-1 max-w-xs mx-auto font-medium">Tidak ada pengajuan baru yang perlu diverifikasi saat ini.</p>
      </div>

      <div v-else class="flex-1 overflow-auto p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="point in pendingPoints" :key="point.id"
            class="group bg-white border border-gray-100 rounded-3xl overflow-hidden hover:border-amber-500/30 transition-all duration-500 flex flex-col shadow-xl shadow-gray-200/50 relative">
            <div class="h-44 bg-gray-100 relative overflow-hidden">
              <img v-if="point.cover_image" :src="point.cover_image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300 font-black uppercase text-[10px] tracking-widest">Tanpa Foto</div>
              <div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                <span class="text-[10px] font-black text-primary uppercase tracking-widest">{{ getCategoryName(point.category_id) }}</span>
              </div>
            </div>

            <div class="p-6 flex-1 flex flex-col">
              <div class="mb-6">
                <h4 class="text-gray-900 font-black text-lg leading-tight group-hover:text-primary transition-colors">{{ point.name }}</h4>
                <p class="text-gray-500 text-xs mt-2 line-clamp-2 font-medium leading-relaxed">{{ point.address }}</p>
              </div>

              <div class="flex items-center gap-4 pt-5 border-t border-gray-50 mt-auto">
                <div
                  class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-500 overflow-hidden border border-gray-100 shadow-inner">
                  <img v-if="point.owner_avatar" :src="point.owner_avatar" class="w-full h-full object-cover">
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-gray-900 text-xs font-black truncate">{{ point.owner_name }}</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{{ new Date(point.created_at || '').toLocaleDateString('id-ID') }}</p>
                </div>
              </div>

              <button @click="openPreview(point)"
                class="mt-6 w-full py-3 bg-primary hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300">
                Tinjau Detail
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isPreviewOpen && selectedPoint" class="fixed inset-0 z-[2000] flex items-center justify-center p-4 lg:p-12">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-md" @click="isPreviewOpen = false"></div>

      <div class="relative bg-white border border-gray-100 rounded-[32px] w-full max-w-6xl max-h-full overflow-hidden flex flex-col shadow-2xl">
        <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-black text-gray-900 tracking-tight">Tinjau Pengajuan</h3>
              <p class="text-[10px] text-gray-400 font-bold tracking-widest mt-1">ID: #{{ selectedPoint?.id }} • Kontributor: {{ selectedPoint?.owner_name }}</p>
            </div>
          </div>
          <button @click="isPreviewOpen = false" class="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div class="lg:col-span-4 space-y-10">
              <div class="space-y-8">
                <div v-for="info in [
                  { label: 'Nama Objek', value: selectedPoint?.name, icon: 'M3.75 6h16.5M3.75 12h16.5m-16.5 5.25h16.5', color: 'text-primary' },
                  { label: 'Kategori', value: getCategoryName(selectedPoint?.category_id), icon: getIconPath(store.objectTypes.find(t => t.id === selectedPoint?.category_id)?.icon), color: 'text-amber-500' },
                  { label: 'Lokasi Spasial', value: `${selectedPoint?.latitude}, ${selectedPoint?.longitude}`, icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-emerald-500' },
                  { label: 'Alamat Lengkap', value: selectedPoint?.address, icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-emerald-500' }
                ]" :key="info.label" class="flex gap-4">
                  <div :class="['w-5 h-5 mt-0.5 shrink-0', info.color]">
                    <svg fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-full h-full">
                      <path stroke-linecap="round" stroke-linejoin="round" :d="info.icon" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ info.label }}</p>
                    <p class="text-sm text-gray-900 font-bold mt-1.5 leading-relaxed">{{ info.value }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="lg:col-span-8">
              <div class="bg-gray-50/50 rounded-[40px] p-8 lg:p-16 border border-gray-100 min-h-full">
                <div v-if="blogData?.content" class="prose-bali max-w-none" v-html="blogData.content"></div>
                <div v-else class="flex flex-col items-center justify-center py-12 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p class="italic text-sm font-bold opacity-40 uppercase tracking-widest text-center">Belum ada konten artikel</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-8 py-8 border-t border-gray-100 bg-gray-50/50 shrink-0 flex items-center justify-end gap-6">
          <button @click="showRejectModal = true"
            class="px-8 py-3.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-sm">
            Tolak Pengajuan
          </button>
          <button @click="verifyPoint('approved')" :disabled="isProcessing"
            class="px-10 py-3.5 bg-primary hover:bg-primary/80 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 disabled:opacity-50">
            {{ isProcessing ? 'Memproses...' : 'Setujui & Publikasikan' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showRejectModal" class="fixed inset-0 z-[2100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-md" @click="showRejectModal = false"></div>
      <div class="relative bg-white border border-gray-200 rounded-3xl w-full max-w-md p-8 shadow-2xl">
        <h3 class="text-xl font-black text-gray-900 mb-2 tracking-tight">Alasan Penolakan</h3>
        <p class="text-gray-500 text-sm mb-6 font-medium">Berikan catatan perbaikan agar kontributor dapat mengedit ulang data ini.</p>
        <textarea v-model="rejectionNote" rows="5"
          class="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 text-gray-900 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium"
          placeholder="Tulis alasan penolakan di sini..."></textarea>
        <div class="flex gap-4 mt-8">
          <button @click="showRejectModal = false" class="flex-1 py-3 text-gray-400 hover:text-gray-900 text-xs font-black uppercase tracking-widest transition-all">Batal</button>
          <button @click="verifyPoint('rejected')" :disabled="!rejectionNote || isProcessing"
            class="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-red-600/30 disabled:opacity-50">
            {{ isProcessing ? '...' : 'Konfirmasi Tolak' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Base Prose Styling for Bali Culture App */
:deep(.prose-bali),
:deep(.ql-editor) {
  font-family: 'Urbanist', sans-serif !important;
  font-size: 16px !important;
  line-height: 1.8 !important;
  color: #334155 !important;
}

:deep(.prose-bali > :first-child) {
  margin-top: 0 !important;
}

:deep(.prose-bali h1),
:deep(.ql-editor h1) {
  font-size: 2.25rem !important;
  font-weight: 800 !important;
  margin-top: 1.5rem !important;
  margin-bottom: 1rem !important;
  letter-spacing: -0.025em !important;
}

:deep(.prose-bali h2),
:deep(.ql-editor h2) {
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  margin-top: 1.25rem !important;
  margin-bottom: 0.75rem !important;
}

:deep(.prose-bali p),
:deep(.ql-editor p) {
  margin-bottom: 1.25rem !important;
  text-align: justify !important;
}

:deep(.ql-align-center) {
  text-align: center !important;
}

:deep(.ql-align-right) {
  text-align: right !important;
}

:deep(.ql-align-justify) {
  text-align: justify !important;
}

:deep(.prose-bali img) {
  border-radius: 0 !important;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1) !important;
  margin: 2rem 0 !important;
}
</style>
