import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useNotificationStore } from './notifications'
import { useUIStore } from './uiStore'
import type { GeoPoint, ObjectType } from '@/types/pointTypes'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const usePointsStore = defineStore('points', () => {
  const points = ref<GeoPoint[]>([])
  const objectTypes = ref<ObjectType[]>([])
  const isModalOpen = ref(false)
  const activePoint = ref<GeoPoint | null>(null)

  const confirmState = ref({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const notificationStore = useNotificationStore()

  const fetchPoints = async (isPublic = false, isMe = false) => {
    let url = `${API_URL}/points`
    if (isPublic) url = `${API_URL}/public/map-points`
    else if (isMe) url = `${API_URL}/points/me`

    try {
      const authStore = useAuthStore()
      const headers: Record<string, string> = {}
      if (!isPublic && authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }

      const res = await fetch(url, { headers })
      const json = await res.json()
      if (json.success) points.value = json.data
    } catch {
      let msg = 'Gagal mengambil data bangunan'
      if (isPublic) msg = 'Gagal mengambil data publik'
      if (isMe) msg = 'Gagal mengambil data kontribusi Anda'
      notificationStore.error(msg)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`)
      const json = await res.json()
      if (json.success) objectTypes.value = json.data
    } catch {
      notificationStore.error('Gagal mengambil data kategori')
    }
  }

  const savePoint = async (pointData: GeoPoint, silent = false) => {
    const authStore = useAuthStore()
    const token = authStore.token
    const isEdit = !!pointData.id
    const method = isEdit ? 'PUT' : 'POST'
    const url = isEdit ? `${API_URL}/points/${pointData.id}` : `${API_URL}/points`

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pointData),
      })
      const json = await res.json()
      if (json.success) {
        const savedPoint = json.data
        if (!savedPoint.owner_name && authStore.user)
          savedPoint.owner_name = authStore.user.full_name

        if (isEdit) {
          const index = points.value.findIndex((p) => p.id === pointData.id)
          if (index !== -1) points.value[index] = savedPoint
        } else {
          points.value.push(savedPoint)
        }

        const uiStore = useUIStore()
        fetchPoints(false, uiStore.filterMyPoints)

        if (!silent) {
          notificationStore.success(
            isEdit ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan',
          )
          closeModal()
        }
        return savedPoint
      } else {
        notificationStore.error(json.message || 'Gagal menyimpan data')
      }
    } catch {
      notificationStore.error('Terjadi kesalahan jaringan')
    }
    return null
  }

  const deletePoint = async (id: number) => {
    const authStore = useAuthStore()
    const token = authStore.token

    try {
      const res = await fetch(`${API_URL}/points/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        points.value = points.value.filter((p) => p.id !== id)

        const uiStore = useUIStore()
        fetchPoints(false, uiStore.filterMyPoints)

        notificationStore.success('Data berhasil dihapus')
      } else {
        notificationStore.error(json.message || 'Gagal menghapus data')
      }
    } catch {
      notificationStore.error('Terjadi kesalahan jaringan')
    }
  }

  const saveBlog = async (pointId: number, blogData: { content: string }) => {
    const authStore = useAuthStore()
    try {
      const res = await fetch(`${API_URL}/points/${pointId}/blog`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify(blogData),
      })
      const json = await res.json()
      if (json.success) {
        notificationStore.success('Konten blog berhasil disimpan')
        return json.data
      } else {
        notificationStore.error(json.message || 'Gagal menyimpan blog')
      }
    } catch {
      notificationStore.error('Kesalahan jaringan saat menyimpan blog')
    }
    return null
  }

  const getBlog = async (pointId: number) => {
    try {
      const res = await fetch(`${API_URL}/points/${pointId}/blog`)
      const json = await res.json()
      if (json.success) return json.data
    } catch {}
    return null
  }

  const openModal = (point?: GeoPoint) => {
    activePoint.value = point ? { ...point } : null
    isModalOpen.value = true
  }

  const closeModal = () => {
    isModalOpen.value = false
    activePoint.value = null
  }

  const requestConfirm = (title: string, message: string, onConfirm: () => void) => {
    confirmState.value = { isOpen: true, title, message, onConfirm }
  }

  const cancelConfirm = () => {
    confirmState.value.isOpen = false
  }

  const filteredPoints = computed(() => {
    const uiStore = useUIStore()
    const authStore = useAuthStore()

    return points.value.filter((point) => {
      const matchSearch =
        point.name.toLowerCase().includes(uiStore.searchQuery.toLowerCase()) ||
        (point.address && point.address.toLowerCase().includes(uiStore.searchQuery.toLowerCase()))

      const matchType = !uiStore.filterTypeId || point.category_id === uiStore.filterTypeId

      const matchOwner = !uiStore.filterMyPoints || point.owner_id === authStore.user?.id

      let matchStatus = true
      if (uiStore.statusFilter !== 'all') {
        if (uiStore.statusFilter === 'draft') {
          matchStatus = point.status === 'draft' || !point.status
        } else {
          matchStatus = point.status === uiStore.statusFilter
        }
      }

      return matchSearch && matchType && matchOwner && matchStatus
    })
  })

  return {
    points,
    objectTypes,
    isModalOpen,
    activePoint,
    confirmState,
    filteredPoints,
    fetchPoints,
    fetchCategories,

    savePoint,
    deletePoint,
    saveBlog,
    getBlog,
    openModal,
    closeModal,
    requestConfirm,
    cancelConfirm,
  }
})
