<script setup lang="ts">
import { computed } from 'vue'
import { useUIStore } from '@/stores/uiStore'
import { usePointsStore } from '@/stores/pointsStore'
import SidebarBrand from './SidebarBrand.vue'
import SidebarNav from './SidebarNav.vue'
import SidebarFooter from './SidebarFooter.vue'

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
</script>

<template>
  <aside @mouseenter="uiStore.isSidebarExpanded = true" @mouseleave="uiStore.isSidebarExpanded = false"
    class="group absolute top-4 left-4 bottom-4 w-16 hover:w-64 flex-col hidden md:flex shrink-0 transition-all duration-300 ease-in-out z-[10000] bg-transparent will-change-[width,filter]"
    :class="{ 'pointer-events-none': isBlurred }">
    <div class="absolute inset-y-0 -left-4 -right-8 z-[-1] cursor-pointer"></div>
    <div :class="[
      'flex-1 flex flex-col bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-200 overflow-hidden',
      { 'blur-[4px] opacity-0 !duration-0': isBlurred }
    ]">
      <SidebarBrand />
      <SidebarNav />
      <SidebarFooter />
    </div>
  </aside>
</template>
