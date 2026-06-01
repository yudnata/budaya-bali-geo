<script setup lang="ts">
import { onMounted } from 'vue'
import { usePointsStore } from '@/stores/pointsStore'
import { useUIStore } from '@/stores/uiStore'
import { useNotificationStore } from '@/stores/notifications'
import MapContainer from '@/features/explore/components/MapContainer.vue'

const store = usePointsStore()
const uiStore = useUIStore()
const notificationStore = useNotificationStore()

onMounted(() => {
  uiStore.filterMyPoints = true
  uiStore.isEditMode = false
})

const handleMapClick = (data: { lat: number; lng: number; address?: string }) => {
  notificationStore.info('Membuka form...')
  store.openModal({
    id: 0,
    name: '',
    latitude: data.lat,
    longitude: data.lng,
    category_id: 1,
    address: data.address || '',
  })

}
</script>

<template>
  <div class="h-full w-full flex flex-col overflow-hidden relative">
    <MapContainer @map-clicked="handleMapClick" />
  </div>
</template>
