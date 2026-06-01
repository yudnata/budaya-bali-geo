import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GeoPoint } from '@/types/pointTypes'

export const useUIStore = defineStore('ui', () => {
  const isSidebarExpanded = ref(false)
  const isProfileModalOpen = ref(false)
  const isLogoutModalOpen = ref(false)
  const isReviewModalOpen = ref(false)
  const isCategoryModalOpen = ref(false)

  const isEditMode = ref(false)
  const flyToCoords = ref<{ lat: number; lng: number } | null>(null)
  const selectedPreviewPoint = ref<GeoPoint | null>(null)

  const searchQuery = ref('')
  const filterTypeId = ref<number | null>(null)
  const filterMyPoints = ref(false)
  const statusFilter = ref<'all' | 'draft' | 'pending' | 'approved' | 'rejected'>('all')

  const toggleSidebar = () => {
    isSidebarExpanded.value = !isSidebarExpanded.value
  }

  const toggleEditMode = () => {
    isEditMode.value = !isEditMode.value
  }

  const openProfileModal = () => {
    isProfileModalOpen.value = true
  }

  const closeProfileModal = () => {
    isProfileModalOpen.value = false
  }

  const flyTo = (lat: number, lng: number) => {
    flyToCoords.value = { lat, lng }
  }

  const setSelectedPreviewPoint = (point: GeoPoint | null) => {
    selectedPreviewPoint.value = point
  }

  return {
    isSidebarExpanded,
    isProfileModalOpen,
    isLogoutModalOpen,
    isReviewModalOpen,
    isCategoryModalOpen,
    isEditMode,
    flyToCoords,
    selectedPreviewPoint,
    searchQuery,
    filterTypeId,
    filterMyPoints,
    statusFilter,
    toggleSidebar,
    toggleEditMode,
    openProfileModal,
    closeProfileModal,
    flyTo,
    setSelectedPreviewPoint,
  }
})
