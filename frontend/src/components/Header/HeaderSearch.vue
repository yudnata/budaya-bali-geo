<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePointsStore } from '@/stores/pointsStore'
import { useUIStore } from '@/stores/uiStore'
import type { GeoPoint } from '@/types/pointTypes'

const store = usePointsStore()
const uiStore = useUIStore()
const router = useRouter()
const route = useRoute()

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  [key: string]: unknown
}

const addressResults = ref<NominatimResult[]>([])
const isSearchingAddress = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const handleSelectPoint = (point: GeoPoint) => {
  if (route.path === '/') {
    router.push(`/blog/${point.id}`)
  } else {
    uiStore.flyTo(point.latitude, point.longitude)
  }
  uiStore.searchQuery = ''
}

const handleSelectAddress = (addr: NominatimResult) => {
  uiStore.flyTo(parseFloat(addr.lat), parseFloat(addr.lon))
  uiStore.searchQuery = ''
  addressResults.value = []
}

watch(() => uiStore.searchQuery, (query) => {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (!query || query.length < 3) {
    addressResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    isSearchingAddress.value = true
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=id`)
      addressResults.value = await res.json()
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      isSearchingAddress.value = false
    }
  }, 800)
})
</script>

<template>
  <div class="flex-1 max-w-sm relative group">
    <div class="absolute inset-y-0 left-3 flex items-center text-gray-400 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    </div>
    <input v-model="uiStore.searchQuery" type="text" placeholder="Cari objek atau alamat..."
      class="w-full h-9 pl-9 pr-4 bg-white border border-gray-200 rounded-xl focus:border-gray-400 transition-all text-xs font-semibold text-gray-800 placeholder:text-gray-400 outline-none shadow-sm" />

    <!-- Results Dropdown -->
    <div v-if="uiStore.searchQuery && (store.filteredPoints.length > 0 || addressResults.length > 0 || isSearchingAddress)"
      class="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden z-[2000] border-gray-100">

      <div class="max-h-80 overflow-y-auto">
        <!-- Section: Database Points -->
        <div v-if="store.filteredPoints.length > 0">
          <h5 class="px-4 py-2 bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">Data Objek</h5>

          <div v-for="point in store.filteredPoints.slice(0, 5)" :key="point.id" @click="handleSelectPoint(point)"
            class="px-4 py-3 hover:bg-primary/5 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0">
            <div class="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-3.5 h-3.5">
                <path fill-rule="evenodd"
                  d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-extrabold text-gray-900 truncate tracking-tight">{{ point.name }}</p>
              <p class="text-[10px] text-gray-500 truncate font-medium">{{ point.address }}</p>
            </div>
          </div>
        </div>

        <!-- Section: Real World Addresses (Geocoding) -->
        <div v-if="addressResults.length > 0">
          <h5 class="px-4 py-2 bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] border-y border-gray-50">Hasil dari Peta Global</h5>
          <div v-for="(addr, index) in addressResults" :key="index" @click="handleSelectAddress(addr)"
            class="px-4 py-3 hover:bg-emerald-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0">
            <div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.015 9.015 0 0 1 8.716 6.747M12 3a9.015 9.015 0 0 0-8.716 6.747" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[11px] font-bold text-gray-700 leading-snug line-clamp-2 tracking-tight">{{ addr.display_name }}</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isSearchingAddress" class="px-4 py-6 flex flex-col items-center justify-center gap-3">
          <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mencari Alamat...</p>
        </div>

        <!-- No Results -->
        <div v-if="!isSearchingAddress && store.filteredPoints.length === 0 && addressResults.length === 0" class="px-4 py-10 text-center">
          <p class="text-xs font-bold text-gray-400">Tidak ada hasil ditemukan.</p>
        </div>
      </div>
    </div>
  </div>
</template>
