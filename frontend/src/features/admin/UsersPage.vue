<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/uiStore'
import { useNotificationStore } from '@/stores/notifications'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const authStore = useAuthStore()
const uiStore = useUIStore()
const notify = useNotificationStore()

interface User {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url?: string
  phone?: string
  is_profile_completed: boolean
  created_at: string
}

const users = ref<User[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

const filteredUsers = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return users.value
  return users.value.filter(u =>
    u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  )
})


const fetchUsers = async () => {
  isLoading.value = true
  try {
    const res = await fetch(`${API_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    const data = await res.json()
    if (data.success) users.value = data.data
    else notify.error(data.message || 'Gagal memuat pengguna')
  } catch {
    notify.error('Gagal terhubung ke server')
  } finally {
    isLoading.value = false
  }
}

const roleBadge = (role: string) => {
  if (role === 'admin') return 'text-amber-600'
  return 'text-blue-600'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(fetchUsers)
</script>


<template>
  <div :class="[
    'h-full w-full flex flex-col transition-[padding] duration-500 ease-in-out overflow-hidden',
    uiStore.isSidebarExpanded ? 'pl-[288px]' : 'pl-24',
    'pt-6 pb-6 pr-6'
  ]">
    <div class="flex-1 flex flex-col bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/40">
        <div>
          <h2 class="text-xl font-extrabold text-gray-900 tracking-tight">Manajemen Tim Kontributor</h2>

          <p class="text-xs text-gray-500 mt-1 font-medium">Daftar seluruh akun yang terdaftar di sistem.</p>
        </div>
        <div class="flex items-center gap-6">
          <div class="text-right">
            <p class="text-xl font-black text-gray-900 leading-none">{{ users.length }}</p>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Total Pengguna</p>
          </div>
          <div class="h-8 w-px bg-gray-200"></div>
          <div class="relative group">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400 group-focus-within:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </span>
            <input v-model="searchQuery" type="text" placeholder="Cari nama atau email..."
              class="pl-9 pr-4 py-2 w-64 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-xs font-bold shadow-sm" />
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center text-gray-400">
        <div class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p class="text-sm font-bold">Memuat data pengguna...</p>
      </div>

      <!-- Table -->
      <div v-else class="flex-1 overflow-auto">
        <table class="w-full text-left border-collapse min-w-max">
          <thead class="bg-gray-50 sticky top-0 shadow-sm outline outline-1 outline-gray-200 z-10">
            <tr>
              <th class="py-3.5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pengguna</th>
              <th class="py-3.5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
              <th class="py-3.5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Peran</th>
              <th class="py-3.5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bergabung</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="filteredUsers.length === 0">
              <td colspan="4" class="py-12 text-center text-gray-400 text-sm italic font-medium">Tidak ada pengguna ditemukan.</td>
            </tr>
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-blue-50/40 transition-colors group">
              <td class="py-4 px-6">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm border border-gray-50">
                    <img v-if="user.avatar_url" :src="user.avatar_url" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-xs font-black text-white">
                      {{ user.full_name?.charAt(0).toUpperCase() || '?' }}
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-black text-gray-900 tracking-tight">{{ user.full_name }}</p>
                  </div>

                </div>
              </td>
              <td class="py-4 px-6 text-sm text-gray-600 font-medium">{{ user.email }}</td>
              <td class="py-4 px-6">
                <span :class="['text-[10px] font-black uppercase tracking-wider', roleBadge(user.role || 'contributor')]">
                  {{ user.role || 'contributor' }}
                </span>


              </td>
              <td class="py-4 px-6 text-xs text-gray-400 font-bold uppercase tracking-tighter">{{ formatDate(user.created_at) }}</td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
