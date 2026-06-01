<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { usePointsStore } from '@/stores/pointsStore'
import type { GeoPoint } from '@/types/pointTypes'
import { useNotificationStore } from '@/stores/notifications'
import { useUIStore } from '@/stores/uiStore'

import PointFormHeader from './PointFormHeader.vue'
import PointForm from './PointForm.vue'
import PointFormActions from './PointFormActions.vue'

const store = usePointsStore()
const uiStore = useUIStore()
const notificationStore = useNotificationStore()

const getDefaultForm = (): Partial<GeoPoint> => ({
  category_id: store.objectTypes.length > 0 ? store.objectTypes[0]?.id || 1 : 1,
  name: '',
  latitude: 0,
  longitude: 0,
  address: '',
  tahun_berdiri: new Date().getFullYear().toString(),
  description: '',
  cover_image: ''
})

const formData = ref<Partial<GeoPoint>>(getDefaultForm())
const isSubmitting = ref(false)
const activeTab = ref<'data' | 'blog'>('data')
const blogContent = ref({ title: '', content: '', cover_photo: '' })

watch(() => store.activePoint, async (newPoint) => {
  if (newPoint) {
    uiStore.setSelectedPreviewPoint(null)
    formData.value = { ...newPoint }
    if (newPoint.id) {
      const blog = await store.getBlog(newPoint.id)
      if (blog) {
        blogContent.value = { title: '', content: blog.content, cover_photo: blog.cover_photo || '' }
      } else {
        blogContent.value = { title: '', content: '', cover_photo: '' }
      }
    }
  } else {
    formData.value = getDefaultForm()
    blogContent.value = { title: '', content: '', cover_photo: '' }
  }
  activeTab.value = 'data'
}, { immediate: true })

const submitForm = async (status: 'draft' | 'pending') => {
  if (!formData.value.name || !formData.value.latitude || !formData.value.longitude) {
    notificationStore.warning('Nama dan Koordinat wajib diisi!')
    return
  }

  if (isSubmitting.value) return
  isSubmitting.value = true

  formData.value.status = status

  const contentSnapshot = blogContent.value.content
  const existingId = formData.value.id

  try {
    const isDraft = status === 'draft'
    const savedPoint = await store.savePoint(formData.value as GeoPoint, isDraft)

    const pointId = savedPoint?.id || existingId
    if (pointId) {
      await store.saveBlog(pointId, {
        content: contentSnapshot
      })

      if (isDraft && savedPoint) {
        formData.value = { ...savedPoint }
      }
    }
  } finally {
    isSubmitting.value = false
  }
}

const goToNextTab = async () => {
  if (!formData.value.name || !formData.value.latitude || !formData.value.longitude) {
    notificationStore.warning('Nama dan Koordinat wajib diisi!')
    return
  }

  if (isSubmitting.value) return
  isSubmitting.value = true

  formData.value.status = formData.value.status || 'draft'

  try {
    const savedPoint = await store.savePoint(formData.value as GeoPoint, true)
    if (savedPoint && savedPoint.id) {
      formData.value = { ...formData.value, id: savedPoint.id }
    }

    const name = formData.value.name || ''
    const cover = formData.value.cover_image || ''
    const coverHtml = cover ? `<img src="${cover}" alt="${name}">` : ''

    if (!blogContent.value.content || blogContent.value.content === '<p><br></p>') {
      blogContent.value.content = `<h1>${name}</h1>${coverHtml}<p></p>`
    } else {
      const parser = new DOMParser()
      const doc = parser.parseFromString(blogContent.value.content, 'text/html')
      const h1 = doc.querySelector('h1')
      if (h1) {
        h1.textContent = name
        blogContent.value.content = doc.body.innerHTML
      }
    }

    activeTab.value = 'blog'
  } finally {
    isSubmitting.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && store.isModalOpen) store.closeModal()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="store.isModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-md" @click="store.closeModal()"></div>

      <div class="relative bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all border border-white/20">

        <PointFormHeader :is-edit="!!formData.id" :active-tab="activeTab" />

        <PointForm v-model="formData" v-model:blog-content="blogContent" :active-tab="activeTab" />

        <PointFormActions :is-edit="!!formData.id" :is-submitting="isSubmitting" :active-tab="activeTab" @submit="submitForm" @next="goToNextTab" @back="activeTab = 'data'" />

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: none !important;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
