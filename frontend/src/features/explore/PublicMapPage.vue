<script setup lang="ts">
import { useUIStore } from '@/stores/uiStore'
import MapContainer from '@/features/explore/components/MapContainer.vue'

const uiStore = useUIStore()

uiStore.isEditMode = false
uiStore.filterMyPoints = false
</script>

<template>
  <div class="h-full w-full relative">
    <MapContainer :is-public="true" />
  </div>

</template>
