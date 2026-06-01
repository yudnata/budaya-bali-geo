<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/uiStore'
import { useNotificationStore } from '@/stores/notifications'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const authStore = useAuthStore()
const uiStore = useUIStore()
const notify = useNotificationStore()


interface Category {
  id: number
  name: string
  icon: string
}

const categories = ref<Category[]>([])
const searchQuery = ref('')
const isLoading = ref(false)
const isSubmitting = ref(false)
const showForm = ref(false)
const isEditing = ref(false)
const deleteConfirmId = ref<number | null>(null)

watch([showForm, deleteConfirmId], () => {
  uiStore.isCategoryModalOpen = showForm.value || deleteConfirmId.value !== null
})

const form = ref({ id: 0, name: '', icon: '' })

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  return categories.value.filter(c =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const iconOptions = [
  { label: 'Temple (Pura)', value: 'temple' },
  { label: 'Waterfall (Air Terjun)', value: 'waterfall' },
  { label: 'Beach (Pantai)', value: 'beach' },
  { label: 'Mountain (Gunung)', value: 'mountain' },
  { label: 'Hill (Bukit)', value: 'hill' },
  { label: 'Lake (Danau)', value: 'lake' },
  { label: 'Forest (Hutan Wisata)', value: 'forest' },
  { label: 'Village (Desa Wisata)', value: 'village' },
  { label: 'Museum', value: 'museum' },
  { label: 'Market (Pasar Seni)', value: 'market' },
]

import { getIconPath } from '@/constants/icons'

const fetchCategories = async () => {
  isLoading.value = true
  try {
    const res = await fetch(`${API_URL}/categories`)
    const data = await res.json()
    if (data.success) categories.value = data.data
  } catch {
    notify.error('Gagal memuat kategori')
  } finally {
    isLoading.value = false
  }
}


const openCreate = () => {
  form.value = { id: 0, name: '', icon: iconOptions[0]?.value ?? 'temple' }
  isEditing.value = false
  showForm.value = true
}

const openEdit = (cat: Category) => {
  form.value = { id: cat.id, name: cat.name, icon: cat.icon }
  isEditing.value = true
  showForm.value = true
}

const submitForm = async () => {
  if (!form.value.name.trim() || !form.value.icon.trim()) {
    notify.warning('Nama dan icon wajib diisi')
    return
  }
  isSubmitting.value = true
  try {
    const method = isEditing.value ? 'PUT' : 'POST'
    const url = isEditing.value ? `${API_URL}/categories/${form.value.id}` : `${API_URL}/categories`
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ name: form.value.name, icon: form.value.icon }),
    })
    const data = await res.json()
    if (data.success) {
      notify.success(isEditing.value ? 'Kategori diperbarui!' : 'Kategori ditambahkan!')
      showForm.value = false
      fetchCategories()
    } else {
      notify.error(data.message || 'Terjadi kesalahan')
    }
  } finally {
    isSubmitting.value = false
  }
}

const deleteCategory = async (id: number) => {
  try {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    const data = await res.json()
    if (data.success) {
      notify.success('Kategori dihapus')
      deleteConfirmId.value = null
      fetchCategories()
    } else {
      notify.error(data.message || 'Gagal menghapus')
    }
  } catch {
    notify.error('Gagal menghapus kategori')
  }
}

onMounted(fetchCategories)
</script>

<template>
  <div :class="[
    'h-full w-full flex flex-col transition-[padding] duration-500 ease-in-out overflow-hidden',
    uiStore.isSidebarExpanded ? 'pl-[288px]' : 'pl-24',
    'pt-6 pb-6 pr-6'
  ]">
    <div class="flex-1 flex flex-col bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between bg-gray-50/40 gap-4">
        <div>
          <h2 class="text-xl font-extrabold text-gray-900 tracking-tight">Kategori Objek</h2>
          <p class="text-xs text-gray-500 mt-1 font-medium">Kelola kategori dan ikon visual untuk pemetaan.</p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Search Bar Modern -->
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input v-model="searchQuery" type="text" placeholder="Cari kategori..."
              class="h-10 pl-10 pr-4 w-full md:w-64 bg-transparent border border-gray-100 rounded-xl text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-200 transition-all" />

          </div>

          <button @click="openCreate"
            class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-primary/20 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span class="hidden sm:inline">Tambah Kategori</span>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center text-gray-400">
        <div class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p class="text-sm font-bold">Memuat kategori...</p>
      </div>

      <!-- Category Grid -->
      <div v-else class="flex-1 overflow-auto p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="cat in filteredCategories" :key="cat.id" class="group bg-white border border-gray-50 rounded-2xl p-5 hover:bg-gray-50/50 transition-all duration-300 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

              <button @click="openEdit(cat)" class="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/10 transition-all" title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
              </button>
              <button @click="deleteConfirmId = cat.id" class="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Hapus">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>

            <div class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center p-3 mb-4 group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
                <path :d="getIconPath(cat.icon)" />
              </svg>
            </div>
            <h3 class="font-black text-gray-900 text-sm uppercase tracking-tight">{{ cat.name }}</h3>
            <p class="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">Icon: {{ cat.icon }}</p>
          </div>
        </div>
      </div>
    </div>


    <!-- Form Modal -->
    <Transition name="modal-fade">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="showForm = false"></div>
        <div class="relative bg-white/90 backdrop-blur-2xl border border-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          <h2 class="text-xl font-black text-gray-900 mb-6 tracking-tight">
            {{ isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
          </h2>

          <div class="space-y-6">
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nama Kategori</label>
              <input v-model="form.name" type="text" placeholder="Contoh: Pura"
                class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                @keyup.enter="submitForm" />
            </div>
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Icon Visual</label>
              <div class="grid grid-cols-5 gap-3">
                <button v-for="opt in iconOptions" :key="opt.value" @click="form.icon = opt.value" :class="[
                  'h-12 rounded-xl flex items-center justify-center p-2.5 transition-all border-2',
                  form.icon === opt.value
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                    : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
                ]" :title="opt.label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
                    <path :d="getIconPath(opt.value)" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="flex gap-4 mt-8">
            <button @click="showForm = false" class="flex-1 py-3.5 rounded-2xl border border-gray-100 text-gray-400 hover:bg-gray-50 text-xs font-black uppercase tracking-widest transition-all">
              Batal
            </button>
            <button @click="submitForm" :disabled="isSubmitting"
              class="flex-1 py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              <svg v-if="isSubmitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              {{ isEditing ? 'Simpan' : 'Tambahkan' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition name="modal-fade">
      <div v-if="deleteConfirmId !== null" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="deleteConfirmId = null"></div>
        <div class="relative bg-white/90 backdrop-blur-2xl border border-red-100 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h3 class="text-xl font-black text-gray-900 mb-2 tracking-tight">Hapus Kategori?</h3>
          <p class="text-gray-400 text-sm mb-8 font-medium">Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada objek yang menggunakan kategori ini.</p>
          <div class="flex gap-4">
            <button @click="deleteConfirmId = null"
              class="flex-1 py-3.5 rounded-2xl border border-gray-100 text-gray-400 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Batal</button>
            <button @click="deleteCategory(deleteConfirmId!)"
              class="flex-1 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-200">Hapus</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
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
