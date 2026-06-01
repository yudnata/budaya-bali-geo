<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUIStore } from '@/stores/uiStore'
import { usePointsStore } from '@/stores/pointsStore'
import HeaderSearch from './HeaderSearch.vue'
import HeaderCategoryFilter from './HeaderCategoryFilter.vue'
import HeaderEditorControls from './HeaderEditorControls.vue'
import HeaderUserInfo from './HeaderUserInfo.vue'

const route = useRoute()
const uiStore = useUIStore()
const pointsStore = usePointsStore()

const isBlurred = computed(() => {
  return uiStore.isProfileModalOpen ||
    uiStore.isLogoutModalOpen ||
    uiStore.isReviewModalOpen ||
    uiStore.isCategoryModalOpen ||
    pointsStore.isModalOpen ||
    pointsStore.confirmState.isOpen ||
    !!uiStore.selectedPreviewPoint
})

const pageTitle = computed(() => {
  if (route.path === '/') return 'Budaya Bali'
  if (route.path === '/explore') return 'Eksplorasi Peta Budaya Bali'
  if (route.path === '/dashboard') return 'Kontribusi Saya'
  if (route.path === '/tabular') return 'Pustaka Data Master'
  if (route.path === '/admin/verification') return 'Verifikasi Objek'
  if (route.path === '/admin/categories') return 'Kelola Kategori'
  if (route.path === '/admin/users') return 'Manajemen Tim'
  return 'Budaya Bali: Digital Mapping'
})

const isDashboard = computed(() => route.path === '/dashboard')
</script>

<template>
  <header :class="[
    'hidden md:flex absolute top-4 right-4 h-16 shrink-0 z-[10000] transition-all duration-300 ease-in-out bg-transparent will-change-[left,filter]',
    uiStore.isSidebarExpanded ? 'left-[288px]' : 'left-24',
    { 'pointer-events-none': isBlurred }
  ]">
    <div :class="[
      'flex-1 flex items-center justify-between bg-white border border-gray-100 px-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-200',
      { 'blur-[4px] opacity-0 !duration-0': isBlurred }
    ]">
      <div class="flex items-center gap-4 shrink-0">
        <h2 class="text-lg font-bold text-gray-800 whitespace-nowrap">{{ pageTitle }}</h2>
      </div>

      <div class="flex items-center gap-2.5 flex-1 px-6">
        <HeaderSearch />
        <HeaderCategoryFilter />
        <HeaderEditorControls v-if="isDashboard" />
      </div>

      <HeaderUserInfo />
    </div>
  </header>
</template>
