<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { usePointsStore } from '@/stores/pointsStore'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/uiStore'
import { storeToRefs } from 'pinia'
import MapLegend from './MapLegend.vue'
import MapPopupContent from './MapPopupContent.vue'

const props = withDefaults(defineProps<{
  isPublic?: boolean
}>(), {
  isPublic: false
})

const emit = defineEmits<{
  (e: 'map-clicked', data: { lat: number; lng: number; address?: string }): void
}>()


const store = usePointsStore()
const authStore = useAuthStore()
const uiStore = useUIStore()

const { filteredPoints, objectTypes } = storeToRefs(store)
const { isEditMode, isSidebarExpanded, flyToCoords } = storeToRefs(uiStore)

import { getIconPath } from '@/constants/icons'


const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markerLayer: L.MarkerClusterGroup | null = null
let draftMarker: L.Marker | null = null
let activeMarkerEl: HTMLElement | null = null

const createDraftMarker = (lat: number, lng: number) => {
  if (!map) return
  if (draftMarker) {
    draftMarker.setLatLng([lat, lng])
  } else {
    const draftIcon = L.divIcon({
      className: 'draft-div-icon',
      html: `
        <div class="relative animate-bounce">
          <div class="w-8 h-8 rounded-xl bg-gray-400/80 backdrop-blur-sm flex items-center justify-center text-white border-2 border-dashed border-white shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="w-4 h-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
    draftMarker = L.marker([lat, lng], { icon: draftIcon, zIndexOffset: 1000 }).addTo(map)
  }
}

const removeDraftMarker = () => {
  if (draftMarker && map) {
    map.removeLayer(draftMarker)
    draftMarker = null
  }
}

const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=id`)
    const data = await res.json()
    return data.display_name || 'Alamat tidak ditemukan'
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return 'Gagal mendeteksi alamat'
  }
}

onMounted(async () => {
  if (!mapContainer.value) return

  if (authStore.token && !authStore.user) {
    await authStore.fetchProfile()
  }

  await store.fetchCategories()
  await store.fetchPoints(props.isPublic)

  const baliBounds = L.latLngBounds(
    L.latLng(-9.0, 114.3),
    L.latLng(-7.9, 115.8)
  )

  map = L.map(mapContainer.value, {
    zoomControl: false,
    maxBounds: baliBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 11,
    bounceAtZoomLimits: true
  }).setView([-8.4095, 115.1889], 11)

  L.control.zoom({ position: 'bottomleft' }).addTo(map)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)

  markerLayer = L.markerClusterGroup({
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    spiderfyOnMaxZoom: true,
    chunkedLoading: true,
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount()
      return L.divIcon({
        html: `<div class="flex items-center justify-center w-10 h-10">
                 <div class="absolute w-full h-full bg-primary/20 animate-ping rounded-full"></div>
                 <div class="relative bg-primary/90 backdrop-blur-md text-white rounded-full w-9 h-9 flex items-center justify-center border-2 border-white shadow-xl font-black text-xs tracking-tighter">
                   ${count}
                 </div>
               </div>`,
        className: 'custom-cluster-icon',
        iconSize: [40, 40]
      })
    }
  }).addTo(map)

  map.on('popupclose', () => {
    if (activeMarkerEl) {
      activeMarkerEl.classList.remove('marker-highlighted')
      activeMarkerEl = null
    }
  })

  map.on('click', async (e: L.LeafletMouseEvent) => {
    uiStore.setSelectedPreviewPoint(null)

    if (!uiStore.isEditMode) return

    emit('map-clicked', { lat: e.latlng.lat, lng: e.latlng.lng })

    if (map) {
      L.popup()
        .setLatLng(e.latlng)
        .setContent('<p class="font-bold text-sm text-primary m-0">⏳ Mendeteksi Alamat...</p>')
        .openOn(map)
    }

    const address = await reverseGeocode(e.latlng.lat, e.latlng.lng)

    if (store.activePoint && store.activePoint.latitude === e.latlng.lat && store.activePoint.longitude === e.latlng.lng) {
      store.activePoint = { ...store.activePoint, address }
    }

    if (map) {
      L.popup()
        .setLatLng(e.latlng)
        .setContent(`<div class="font-bold text-sm text-primary max-w-[200px] leading-tight"><p class="m-0 mb-1">📍 ${address}</p></div>`)
        .openOn(map)
    }
  })

  renderMarkers()

  setTimeout(() => map?.invalidateSize(), 100)
  setTimeout(() => map?.invalidateSize(), 500)
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
  removeDraftMarker()
})

watch(() => store.activePoint, (newPoint) => {
  if (newPoint && (!newPoint.id || newPoint.id === 0)) {
    createDraftMarker(newPoint.latitude, newPoint.longitude)
  } else {
    removeDraftMarker()
  }
})

const getTypeName = (categoryId: number) => {
  const typeObj = objectTypes.value.find(t => t.id === categoryId)
  return typeObj ? typeObj.name : 'Unknown'
}

const renderMarkers = () => {
  if (!map || !markerLayer) return
  markerLayer.clearLayers()

  const colors = [
    '#2D6A4F', '#0077B6', '#D62828', '#F4A261', '#9D4EDD',
    '#FFB703', '#E63946', '#219EBC', '#023047', '#FB8500',
    '#8ECAE6', '#606C38'
  ]

  filteredPoints.value.forEach((point) => {
    const typeObj = objectTypes.value.find(t => t.id === point.category_id)
    const typeIconPath = getIconPath(typeObj?.icon)

    const color = colors[(point.category_id - 1) % colors.length]


    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative group">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 active:scale-95" style="background:${color}; border: 2px solid white;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
              <path d="${typeIconPath}" />
            </svg>
          </div>
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-[${color}] shadow-sm animate-pulse"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -24],
    })

    const marker = L.marker([point.latitude, point.longitude], { icon: customIcon }).addTo(markerLayer!)

    marker.bindTooltip(`
      <div class="font-sans w-48 overflow-hidden">
        ${point.cover_image ? `
          <div class="h-24 w-full mb-2 overflow-hidden rounded-lg">
            <img src="${point.cover_image}" class="w-full h-full object-cover" />
          </div>
        ` : ''}
        <div class="p-1">
          <p class="font-black text-slate-900 text-sm leading-tight mb-1">${point.name}</p>
          <p class="text-[10px] text-slate-500 font-medium leading-tight">${point.address || 'Lokasi Budaya'}</p>
        </div>
      </div>
    `, {
      direction: 'top',
      offset: [0, -10],
      className: 'custom-leaflet-tooltip'
    })

    marker.on('mouseover', (e) => {
      const el = (e.target as L.Marker).getElement()
      if (el) {
        el.classList.add('marker-highlighted')
      }
    })

    marker.on('mouseout', (e) => {
      const el = (e.target as L.Marker).getElement()
      if (el) {
        el.classList.remove('marker-highlighted')
      }
    })

    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e)
      uiStore.setSelectedPreviewPoint(point)
    })
  })
}

watch([filteredPoints, isEditMode, () => authStore.user], () => {
  renderMarkers()
})

watch(isEditMode, (newMode) => {
  if (mapContainer.value) {
    mapContainer.value.style.cursor = newMode ? 'crosshair' : 'grab'
  }
})

watch(isSidebarExpanded, () => {
  nextTick(() => {
    setTimeout(() => map?.invalidateSize(), 100)
    setTimeout(() => map?.invalidateSize(), 550)
  })
})

watch([() => uiStore.selectedPreviewPoint, isEditMode], ([newPoint, newEdit]) => {
  if (!newPoint || newEdit) {
    map?.closePopup()
  }
})

watch(flyToCoords, (newCoords) => {
  if (newCoords && map) {
    map.flyTo([newCoords.lat, newCoords.lng], 16)

    setTimeout(() => {
      markerLayer?.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.Marker) {
          const latLng = layer.getLatLng()
          if (latLng.lat === newCoords.lat && latLng.lng === newCoords.lng) {
            markerLayer?.zoomToShowLayer(layer, () => {
              const targetPoint = filteredPoints.value.find(p => p.latitude === newCoords.lat && p.longitude === newCoords.lng)
              if (targetPoint) {
                uiStore.setSelectedPreviewPoint(targetPoint)
              }
            })
          }
        }
      })
    }, 500)
  }
})
</script>

<template>
  <div class="relative w-full h-full flex-1 min-h-0">
    <div ref="mapContainer" class="w-full h-full bg-slate-100 z-0"></div>
    <MapLegend />

    <!-- Modern Centered Modal Preview -->
    <Transition name="fade-modal">
      <div v-if="uiStore.selectedPreviewPoint" class="absolute inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 !duration-0"
        @click.self="uiStore.setSelectedPreviewPoint(null)">
        <div class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden modal-content !duration-0">
          <!-- Close Button -->
          <button @click="uiStore.setSelectedPreviewPoint(null)"
            class="absolute top-4 right-4 w-7 h-7 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full flex items-center justify-center z-10 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <MapPopupContent :point="uiStore.selectedPreviewPoint" :typeName="getTypeName(uiStore.selectedPreviewPoint.category_id)" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: none !important;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
</style>

<style>
.leaflet-container {
  font-family: inherit;
}

.premium-popup .leaflet-popup-content-wrapper {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.premium-popup .leaflet-popup-content {
  margin: 0;
}

.premium-popup .leaflet-popup-tip {
  background: white;
}

/* Marker Highlight Effect */
@keyframes radar-pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }

  100% {
    transform: scale(3);
    opacity: 0;
  }
}

.marker-highlighted {
  z-index: 9999 !important;
}

.marker-highlighted::before,
.marker-highlighted::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32px;
  height: 32px;
  margin-top: -16px;
  margin-left: -16px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.5);
  animation: radar-pulse 1.8s ease-out infinite;
  pointer-events: none;
}

.marker-highlighted::after {
  animation-delay: 0.7s;
}

.marker-highlighted .custom-div-icon>div>div:first-child,
.marker-highlighted>div>div>div:first-child {
  transform: scale(1.25) translateY(-3px);
  box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.35), 0 0 0 4px rgba(59, 130, 246, 0.25);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
