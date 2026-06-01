<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notifications'
import { useUIStore } from '@/stores/uiStore'
import { usePointsStore } from '@/stores/pointsStore'
import type { GeoPoint } from '@/types/pointTypes'

import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'


interface BlogDetail {
  blog: {
    id: number
    title: string
    content: string
    cover_photo: string | null
    updated_at: string
  }
  point: GeoPoint
}

const route = useRoute()
const router = useRouter()
const notificationStore = useNotificationStore()
const uiStore = useUIStore()
const mapPointsStore = usePointsStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const getCategoryName = (id: number) => {
  return mapPointsStore.objectTypes.find(t => t.id === id)?.name || 'Destinasi'
}


const detail = ref<BlogDetail | null>(null)
const isLoading = ref(true)

const initMiniMap = () => {
  const currentDetail = detail.value
  if (!currentDetail) return

  setTimeout(() => {
    const mapElement = document.getElementById('mini-map')
    if (!mapElement) return

    const map = L.map(mapElement, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: false
    }).setView([currentDetail.point.latitude, currentDetail.point.longitude], 15)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    const icon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="width: 36px; height: 36px; background-color: #3b82f6; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; color: white;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
             <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36]
    })

    L.marker([currentDetail.point.latitude, currentDetail.point.longitude], { icon }).addTo(map)
  }, 100)
}

const fetchBlogDetail = async () => {
  try {
    const res = await fetch(`${API_URL}/public/blogs/${route.params.id}`)
    const json = await res.json()
    if (json.success) {
      detail.value = json.data

      if (mapPointsStore.objectTypes.length === 0) {
        await mapPointsStore.fetchCategories()
      }

      initMiniMap()
    } else {
      notificationStore.error('Gagal memuat detail ulasan')
      router.push('/')
    }
  } catch {
    notificationStore.error('Terjadi kesalahan jaringan')
    router.push('/')
  } finally {
    isLoading.value = false
  }
}

const shareToWhatsApp = () => {
  if (!detail.value) return
  const text = `Halo! Lihat artikel tentang "${detail.value.point.name}" di Budaya Bali: ${window.location.href}`
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    notificationStore.success('Link berhasil disalin ke clipboard!')
  } catch {
    notificationStore.error('Gagal menyalin link')
  }
}

const formatFullDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' - ' +
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

onMounted(fetchBlogDetail)

</script>

<template>
  <div :class="[
    'min-h-screen bg-slate-50 pb-20 transition-[padding] duration-500 ease-in-out overflow-y-auto',
    uiStore.isSidebarExpanded ? 'pl-[288px]' : 'pl-24',
    'pt-12 pr-6'
  ]">

    <!-- Content -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center h-[60vh]">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-slate-400 font-bold animate-pulse">Memuat Ulasan...</p>
    </div>

    <div v-else-if="detail" class="max-w-4xl mx-auto">
      <!-- Header Section -->
      <header class="mb-12">
        <div class="flex items-center flex-wrap gap-6 mb-8 text-slate-500 border-b-2 border-slate-200 pb-8">
          <span class="font-bold text-slate-900 text-sm tracking-tight">{{ detail.point.owner_email || 'admin@sig.bali.go.id' }}</span>

          <div class="h-4 w-px bg-slate-200"></div>

          <div class="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ formatFullDate(detail.point.created_at) }}</span>
          </div>

          <div class="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>{{ formatFullDate(detail.blog.updated_at) }}</span>
          </div>

          <div class="h-4 w-px bg-slate-200"></div>

          <span class="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-200">
            {{ getCategoryName(detail.point.category_id) }}
          </span>
        </div>
      </header>

      <!-- Article Body -->
      <article class="prose-bali max-w-none">
        <div v-html="detail.blog.content"></div>
      </article>

      <!-- Footer Section Starts Here -->
      <div class="mt-12 pt-8 border-t-2 border-slate-200">
        <!-- Mini Map Location -->
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
          <div class="p-8 md:w-1/3 bg-white flex flex-col justify-center">
            <p class="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Lokasi Budaya</p>
            <h3 class="text-xl font-black text-slate-900 mb-2">{{ detail.point.name }}</h3>
            <p class="text-sm text-slate-500 font-medium leading-relaxed">{{ detail.point.address }}</p>
          </div>
          <div class="h-64 md:h-auto md:w-2/3 bg-slate-200 relative" id="mini-map"></div>
        </div>

        <!-- Author & Share Combined Card -->
        <footer class="mt-6">
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center gap-8">
            <!-- Author Info -->
            <div class="flex items-center gap-4 flex-1">
              <div class="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                <img v-if="detail.point.owner_avatar" :src="detail.point.owner_avatar" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center font-black text-slate-400 text-2xl">
                  {{ detail.point.owner_name?.charAt(0) || 'S' }}
                </div>
              </div>
              <div>
                <p class="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-2">Penulis Artikel</p>
                <p class="text-xl font-black text-slate-900 tracking-tight">{{ detail.point.owner_name || 'Sistem' }}</p>
                <p class="text-xs text-slate-500 font-medium italic mt-1">Kontributor Warisan Budaya Bali</p>
              </div>
            </div>

            <!-- Vertical Divider -->
            <div class="hidden lg:block w-px h-12 bg-slate-100"></div>
            <div class="lg:hidden w-full h-px bg-slate-100"></div>

            <!-- Share Info -->
            <div class="flex flex-col lg:flex-row items-center gap-6 flex-1 justify-between w-full lg:w-auto">
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3 text-center lg:text-left">Bagikan Budaya</p>
                <div class="flex items-center gap-3">
                  <button @click="copyLink" title="Salin Link"
                    class="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center border border-slate-100 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                  </button>
                  <button @click="shareToWhatsApp" title="WhatsApp"
                    class="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center border border-slate-100 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path
                        d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.06 3.973L0 16l4.204-1.102a7.923 7.923 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                    </svg>
                  </button>
                </div>
              </div>

              <button @click="router.push('/')"
                class="w-full lg:w-auto px-8 py-4 bg-primary text-white font-extrabold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-primary/20 shrink-0 text-sm">
                Jelajahi Budaya Lainnya
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Base Prose Styling for Bali Culture App */
.prose-bali {
  font-family: 'Urbanist', sans-serif !important;
  font-size: 16px !important;
  line-height: 1.8 !important;
  color: #334155 !important;
}

:deep(.prose-bali h1) {
  display: block !important;
  font-size: 2.25rem !important;
  font-weight: 800 !important;
  margin-top: 2rem !important;
  margin-bottom: 1.5rem !important;
  letter-spacing: -0.025em !important;
  color: #0f172a !important;
  line-height: 1.2 !important;
}

:deep(.prose-bali h2) {
  display: block !important;
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  margin-top: 1.5rem !important;
  margin-bottom: 1rem !important;
  color: #1e293b !important;
  line-height: 1.3 !important;
}

:deep(.prose-bali p) {
  margin-bottom: 1.25rem !important;
  text-align: justify !important;
}

:deep(.ql-align-center) { text-align: center !important; }
:deep(.ql-align-right) { text-align: right !important; }
:deep(.ql-align-justify) { text-align: justify !important; }

:deep(.prose-bali img) {
  display: block !important;
  margin: 2.5rem auto !important;
  max-width: 100% !important;
  height: auto !important;
  border-radius: 0 !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
}

:deep(.prose-bali ul),
:deep(.prose-bali ol) {
  margin-bottom: 1.25rem !important;
  padding-left: 1.5rem !important;
}

:deep(.prose-bali li) {
  margin-bottom: 0.5rem !important;
}

:deep(.prose-bali strong) {
  color: #0f172a !important;
  font-weight: 800 !important;
}

/* Ensure the wrapper doesn't have its own prose style */
article {
  all: unset;
  display: block;
}
</style>
