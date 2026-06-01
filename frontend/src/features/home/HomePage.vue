<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { usePointsStore } from '@/stores/pointsStore'
import { useUIStore } from '@/stores/uiStore'
import { RouterLink } from 'vue-router'
import type { GeoPoint } from '@/types/pointTypes'

const store = usePointsStore()
const uiStore = useUIStore()

onMounted(async () => {
  await store.fetchCategories()
  await store.fetchPoints(true)
})

const filteredPoints = computed(() => {
  return store.points.filter((point) => {
    const query = uiStore.searchQuery.toLowerCase()
    const matchSearch =
      point.name.toLowerCase().includes(query) ||
      (point.address && point.address.toLowerCase().includes(query))
    const matchType = !uiStore.filterTypeId || point.category_id === uiStore.filterTypeId
    return matchSearch && matchType && point.status === 'approved'
  })
})

const sideItems = computed(() => {
  return filteredPoints.value.slice(1, 3)
})

const headlines = computed(() => {
  if (filteredPoints.value.length === 0) return []

  const allFiltered = filteredPoints.value
  const excludedIds = [heroItem.value?.id, ...sideItems.value.map(p => p.id)].filter(Boolean) as number[]
  const remaining = allFiltered.filter(p => p.id !== undefined && !excludedIds.includes(p.id as number))

  if (remaining.length >= 5) {
    return remaining.slice(0, 5)
  }

  if (allFiltered.length <= 5) {
    return allFiltered
  }

  return allFiltered.slice(0, 5)
})

const heroItem = computed(() => {
  if (filteredPoints.value.length === 0) return null
  return filteredPoints.value[currentIndex.value % filteredPoints.value.length]
})

const currentIndex = ref(0)

const nextSlide = () => {
  currentIndex.value++
}

const prevSlide = () => {
  if (currentIndex.value === 0) {
    currentIndex.value = filteredPoints.value.length - 1
  } else {
    currentIndex.value--
  }
}

const pointsByCategory = computed(() => {
  const groups: Record<number, GeoPoint[]> = {}
  filteredPoints.value.forEach(point => {
    const catId = point.category_id
    if (catId === undefined) return
    if (!groups[catId]) groups[catId] = []
    groups[catId].push(point)
  })

  return store.objectTypes.map(cat => ({
    ...cat,
    points: groups[cat.id] || []
  })).filter(cat => cat.points.length > 0)
})

const getTypeName = (categoryId: number) => {
  return store.objectTypes.find(t => t.id === categoryId)?.name || 'Budaya'
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Mei 8, 2026'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' })
}

let heroInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await store.fetchCategories()
  await store.fetchPoints(true)
  heroInterval = setInterval(nextSlide, 5000)
})

onUnmounted(() => {
  if (heroInterval) clearInterval(heroInterval)
})

const breakingNews = computed(() => {
  const titles = filteredPoints.value.map(p => p.name)
  if (titles.length === 0) return ["Memuat data budaya terbaru...", "Budaya Bali: Warisan Dunia"]
  return [...titles, ...titles, ...titles].slice(0, 15)
})

const stripHtml = (html?: string, excludeTitle?: string) => {
  if (!html) return ''
  let text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()

  if (excludeTitle) {
    const cleanTitle = excludeTitle.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
    const cleanText = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
    if (cleanText.startsWith(cleanTitle) || (cleanTitle.length > 5 && cleanText.startsWith(cleanTitle.substring(0, 15)))) {
      const firstSentence = text.indexOf('.')
      if (firstSentence > 0 && firstSentence < 100) {
        const sentence = text.substring(0, firstSentence).toLowerCase()
        const firstWord = cleanTitle.split(' ')[0]
        if (firstWord && sentence.includes(firstWord)) {
          text = text.substring(firstSentence + 1).trim()
        }
      } else {
        text = text.substring(excludeTitle.length).trim()
      }
    }
  }

  return text.replace(/^[:\-\s,]+/, '').trim()
}

</script>

<template>
  <div :class="[
    'h-full w-full transition-[padding] duration-500 ease-in-out overflow-y-auto bg-[#f8fafc] scroll-smooth',
    uiStore.isSidebarExpanded ? 'pl-[288px]' : 'pl-24',
    'pt-20 pb-12 pr-8'
  ]">

    <!-- Breaking News Bar -->
    <div class="flex items-center mb-8 mx-4">
      <div class="px-4 py-2 overflow-hidden whitespace-nowrap">
        <p class="text-[11px] font-bold text-gray-500 animate-scroll">
          <template v-for="(news, idx) in breakingNews" :key="idx">
            {{ news }}
            <span v-if="idx < breakingNews.length - 1" class="mx-4 text-gray-300">|</span>
          </template>
        </p>
      </div>
    </div>

    <!-- Hero / Featured Section -->
    <div v-if="filteredPoints.length > 0" class="grid grid-cols-12 gap-8 px-4 mb-16">
      <!-- Main Featured Grid -->
      <div class="col-span-12 lg:col-span-9 grid grid-cols-12 gap-6">
        <!-- Big Featured Slider -->
        <div class="col-span-12 md:col-span-8 relative aspect-[4/3] md:aspect-[16/11] overflow-hidden group rounded-sm bg-gray-100">
          <div class="flex h-full w-full transition-transform duration-700 ease-in-out" :style="{ transform: `translateX(-${(currentIndex % filteredPoints.length) * 100}%)` }">
            <div v-for="point in filteredPoints" :key="point.id" class="w-full h-full shrink-0 relative bg-gray-50">
              <img v-if="point.cover_image" :src="point.cover_image" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80"></div>
              <div class="absolute bottom-0 left-0 p-8 w-full">
                <span class="inline-block px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest mb-4">
                  {{ getTypeName(point.category_id) }}
                </span>
                <h1 class="text-4xl font-black text-white mb-4 leading-tight tracking-tighter">
                  {{ point.name }}
                </h1>
                <div class="flex items-center gap-3 text-white/50 text-[10px] font-bold tracking-widest">
                  <span class="text-white">{{ point.owner_name || 'Budaya Bali' }}</span>
                  <span>|</span>
                  <span>{{ formatDate(point.created_at) }}</span>
                </div>
              </div>
              <RouterLink :to="`/blog/${point.id}`" class="absolute inset-0 z-10"></RouterLink>
            </div>
          </div>

          <!-- Slider Controls -->
          <button @click="prevSlide"
            class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button @click="nextSlide"
            class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <!-- Mid Small Items -->
        <div class="col-span-12 md:col-span-4 flex flex-col gap-6">
          <div v-for="point in sideItems" :key="point.id" class="relative flex-1 aspect-[16/10] md:aspect-auto overflow-hidden group rounded-sm bg-gray-50">
            <img v-if="point.cover_image" :src="point.cover_image" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80"></div>
            <div class="absolute bottom-0 left-0 p-6 w-full">
              <span class="inline-block px-2 py-0.5 bg-primary text-white text-[8px] font-black uppercase tracking-widest mb-2">
                {{ getTypeName(point.category_id) }}
              </span>
              <h2 class="text-sm font-black text-white mb-2 leading-tight line-clamp-2 tracking-tight">
                {{ point.name }}
              </h2>
              <div class="text-white/40 text-[8px] font-bold uppercase tracking-widest">
                {{ formatDate(point.created_at) }}
              </div>
            </div>
            <RouterLink :to="`/blog/${point.id}`" class="absolute inset-0 z-10"></RouterLink>
          </div>
        </div>
      </div>

      <!-- Top Headlines -->
      <div class="col-span-12 lg:col-span-3">
        <div class="flex items-center gap-4 mb-8">
          <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest flex-shrink-0">Top Headlines</h3>
          <div class="h-px bg-gray-200 flex-grow"></div>
        </div>
        <div class="flex flex-col gap-5">
          <div v-for="point in headlines" :key="point.id" class="group cursor-pointer relative">
            <RouterLink :to="`/blog/${point.id}`" class="flex gap-4 items-start">
              <div class="w-28 h-20 shrink-0 overflow-hidden bg-gray-50 rounded-sm shadow-sm">
                <img v-if="point.cover_image" :src="point.cover_image" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div class="flex-1 min-w-0 py-0.5">
                <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest mb-1">
                  <span class="text-primary">{{ getTypeName(point.category_id) }}</span>
                  <span class="text-gray-300">/</span>
                  <span class="text-gray-400">{{ formatDate(point.created_at) }}</span>
                </div>
                <h4 class="text-sm font-black text-gray-800 group-hover:text-primary transition-colors leading-tight line-clamp-1 tracking-tight mb-1">
                  {{ point.name }}
                </h4>
                <p class="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                  {{ stripHtml(point.blog_content, point.name) || 'Pelajari warisan budaya ini lebih dalam...' }}
                </p>
              </div>
            </RouterLink>
          </div>
          <div v-if="headlines.length === 0" class="py-10 text-center border border-dashed border-gray-100 rounded-xl">
            <p class="text-[10px] font-black text-gray-300 uppercase tracking-widest">Belum ada berita lainnya</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="py-24 px-4 mb-16 text-center">
      <div class="max-w-md mx-auto p-16">
        <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-gray-300">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <h3 class="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Tidak ada data ditemukan</h3>
        <p class="text-xs font-bold text-gray-400 tracking-widest leading-relaxed">
          Coba gunakan kata kunci lain atau hapus filter untuk melihat semua data budaya.
        </p>
      </div>
    </div>

    <!-- Categories Grid -->
    <div class="px-4 space-y-10">
      <section v-for="category in pointsByCategory" :key="category.id" class="w-full">
        <div class="flex items-end justify-between mb-4 border-b border-gray-50 pb-2">
          <div>
            <span class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Kategori Budaya</span>
            <h3 class="text-3xl font-black text-gray-900 tracking-tighter">{{ category.name }}</h3>
          </div>
          <RouterLink to="/explore" class="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
            Lihat di Peta &rarr;
          </RouterLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="point in category.points.slice(0, 8)" :key="point.id" class="group cursor-pointer relative">
            <div class="relative aspect-square overflow-hidden bg-gray-50">
              <img v-if="point.cover_image" :src="point.cover_image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div class="flex items-center gap-2 mb-2 mt-4">
              <div class="w-1.5 h-1.5 bg-primary/30 rounded-full"></div>
              <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">{{ formatDate(point.created_at) }}</span>
            </div>
            <h4 class="font-black text-gray-900 group-hover:text-primary transition-colors text-base mb-1 tracking-tight leading-tight">
              {{ point.name }}
            </h4>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider line-clamp-1">
              {{ point.address }}
            </p>
            <RouterLink :to="`/blog/${point.id}`" class="absolute inset-0 z-10"></RouterLink>
          </div>
        </div>
      </section>
    </div>

  </div>
</template>

<style scoped>
.animate-scroll {
  display: inline-block;
  padding-left: 100%;
  animation: scroll 30s linear infinite;
}

@keyframes scroll {
  0% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(-100%, 0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar for minimalist look */
.h-full::-webkit-scrollbar {
  width: 6px;
}

.h-full::-webkit-scrollbar-track {
  background: transparent;
}

.h-full::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.h-full::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
