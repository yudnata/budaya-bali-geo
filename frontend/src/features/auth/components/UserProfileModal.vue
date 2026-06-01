<script setup lang="ts">
import { ref, computed, watch } from 'vue'


import { useAuthStore, type User } from '@/stores/auth'

import { useUIStore } from '@/stores/uiStore'
import { usePointsStore } from '@/stores/pointsStore'
import { useNotificationStore } from '@/stores/notifications'

const authStore = useAuthStore()
const uiStore = useUIStore()
const pointsStore = usePointsStore()
const notificationStore = useNotificationStore()

const fileInput = ref<HTMLInputElement | null>(null)
const previewImage = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const isPreviewOpen = ref(false)

const realContributionCount = computed(() => {
  if (!authStore.user) return 0
  return pointsStore.points.filter(p => p.owner_id === authStore.user?.id).length
})

const handleClose = () => {
  uiStore.closeProfileModal()
  isChangingPassword.value = false
  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  errorMsg.value = ''
}

const handleLogout = () => {
  uiStore.isLogoutModalOpen = true
  handleClose()
}


const isChangingPassword = ref(false)
const isEditingProfile = ref(false)
const fullName = ref('')
const avatarURL = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

watch(() => authStore.user, (u: User | null) => {

  if (u) {
    fullName.value = u.full_name || ''
    avatarURL.value = u.avatar_url || ''
  }
}, { immediate: true })


const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    selectedFile.value = file
    previewImage.value = URL.createObjectURL(file)
    isPreviewOpen.value = true
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}


const handleUpdateName = async () => {
  if (!fullName.value) {
    errorMsg.value = 'Nama lengkap wajib diisi.'
    return
  }

  isLoading.value = true
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        full_name: fullName.value,
        phone: authStore.user?.phone || '',
        avatar_url: authStore.user?.avatar_url || '',
      }),
    })
    const json = await res.json()
    if (json.success) {
      notificationStore.success('Nama berhasil diperbarui!')
      authStore.user = json.data
      isEditingProfile.value = false
    } else {
      errorMsg.value = json.message || 'Gagal memperbarui profil.'
    }
  } catch (err: unknown) {
    console.error("Profile update error:", err)
    errorMsg.value = err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.'
  } finally {
    isLoading.value = false
  }
}

const handleUploadAvatar = async () => {
  if (!selectedFile.value) return

  isLoading.value = true
  errorMsg.value = ''
  try {
    const formData = new FormData()
    formData.append('avatar', selectedFile.value)

    const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: formData,
    })

    if (!uploadRes.ok) {
      let errMsg = 'Gagal mengunggah foto'
      try {
        const errorJson = await uploadRes.json()
        errMsg = errorJson.message || errMsg
      } catch { }
      throw new Error(errMsg)
    }

    const uploadJson = await uploadRes.json()
    if (uploadJson.success) {
      const finalAvatarURL = uploadJson.data.url
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          full_name: authStore.user?.full_name || '',
          phone: authStore.user?.phone || '',
          avatar_url: finalAvatarURL,
        }),
      })
      const json = await res.json()
      if (json.success) {
        notificationStore.success('Foto profil diperbarui!')
        authStore.user = json.data
        selectedFile.value = null
        previewImage.value = null
        isPreviewOpen.value = false
      } else {
        throw new Error(json.message || 'Gagal menyimpan URL avatar ke profil')
      }
    }
  } catch (err: unknown) {
    console.error("Avatar update error:", err)
    errorMsg.value = err instanceof Error ? err.message : 'Gagal mengunggah foto'
  } finally {
    isLoading.value = false
  }
}

const handleChangePassword = async () => {
  errorMsg.value = ''
  if (authStore.user?.has_password && !oldPassword.value) {
    errorMsg.value = 'Password lama wajib diisi.'
    return
  }
  if (!newPassword.value || newPassword.value.length < 6) {
    errorMsg.value = 'Password baru minimal 6 karakter.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Konfirmasi password tidak cocok.'
    return
  }

  isLoading.value = true
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        old_password: oldPassword.value || undefined,
        new_password: newPassword.value,
      }),
    })
    const json = await res.json()
    if (json.success) {
      notificationStore.success('Password berhasil diperbarui!')
      if (authStore.user) authStore.user.has_password = true
      isChangingPassword.value = false
      oldPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    } else {
      errorMsg.value = json.message || 'Gagal memperbarui password.'
    }
  } catch (err) {
    console.error(err)
    errorMsg.value = 'Terjadi kesalahan jaringan.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Teleport to="body" v-if="uiStore.isProfileModalOpen">
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      <!-- Backdrop Overlay -->
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" @click="handleClose"></div>

      <!-- Modal Content (Horizontal Split Layout) -->
      <div class="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col md:flex-row animate-fade-in-up border border-white/20">

        <!-- Left Panel: Profile Sidebar (35%) -->
        <div class="md:w-[35%] bg-gradient-to-b from-primary/10 via-white to-white p-12 flex flex-col items-center border-r border-gray-50">
          <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileSelect" />

          <!-- Avatar Section -->
          <div class="relative group cursor-pointer mb-8" @click="triggerFileInput">
            <div
              class="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-white border-4 border-white shadow-2xl flex items-center justify-center relative rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <img v-if="previewImage || authStore.user?.avatar_url" :src="previewImage || authStore.user?.avatar_url" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full bg-primary/5 flex items-center justify-center text-primary/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <!-- Edit Overlay -->
              <div class="absolute inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span class="text-white text-[10px] font-black uppercase tracking-widest">Ubah Foto</span>
              </div>
            </div>
            <div v-if="authStore.user" class="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-2xl shadow-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-white">
                <path fill-rule="evenodd"
                  d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-3.946-4.654a.75.75 0 010 1.06l-2.5 2.5a.75.75 0 01-1.06 0l-1.25-1.25a.75.75 0 111.06-1.06l.72.72 1.97-1.97a.75.75 0 011.06 0z"
                  clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- Name & Email -->
          <div class="text-center w-full">
            <h2 class="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {{ authStore.user ? authStore.user.full_name : 'Guest User' }}
            </h2>
            <div class="flex items-center justify-center gap-2 mt-2">
              <span class="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                {{ authStore.user ? authStore.user.role : 'Visitor' }}
              </span>
              <span v-if="authStore.user" class="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                Verified
              </span>
            </div>
            <p class="text-xs font-bold text-slate-400 mt-4 tracking-wide break-all">
              {{ authStore.user ? authStore.user.email : 'Belum terautentikasi' }}
            </p>
          </div>
        </div>

        <!-- Right Panel: Detailed Settings (65%) -->
        <div class="md:w-[65%] p-10 bg-white flex flex-col overflow-y-auto max-h-[85vh]">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Pengaturan Akun</h3>
            <div class="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Kontribusi:</span>
              <span class="text-xs font-black text-primary">{{ realContributionCount }} Titik</span>
            </div>
          </div>

          <div class="space-y-8">
            <!-- Edit Profile Name Section -->
            <section>
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h4 class="text-lg font-black text-slate-900 tracking-tight">Informasi Dasar</h4>
                  <p class="text-xs text-slate-400 font-medium">Ubah nama tampilan Anda di sistem pemetaan.</p>
                </div>
                <button @click="isEditingProfile = !isEditingProfile"
                  class="px-4 py-2 rounded-xl border-2 border-slate-50 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                  {{ isEditingProfile ? 'Batal' : 'Edit Profil' }}
                </button>
              </div>

              <div v-if="isEditingProfile" class="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 animate-fade-in-up">
                <div class="space-y-4">
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                    <input v-model="fullName" type="text"
                      class="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold text-slate-700 outline-none" />
                  </div>
                  <button @click="handleUpdateName" :disabled="isLoading"
                    class="w-full bg-primary text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-primary/20 text-xs uppercase tracking-widest disabled:opacity-50">
                    {{ isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
                  </button>
                </div>
              </div>
            </section>

            <!-- Divider -->
            <div class="h-px bg-slate-50"></div>

            <!-- Password Management Section -->
            <section v-if="authStore.user">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h4 class="text-lg font-black text-slate-900 tracking-tight">Keamanan Akun</h4>
                  <p class="text-xs text-slate-400 font-medium">Lindungi akun Anda dengan password yang kuat.</p>
                </div>
                <button @click="isChangingPassword = !isChangingPassword"
                  class="px-4 py-2 rounded-xl border-2 border-slate-50 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                  {{ isChangingPassword ? 'Batal' : (authStore.user?.has_password ? 'Ubah Password' : 'Set Password') }}
                </button>
              </div>

              <div v-if="isChangingPassword" class="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 animate-fade-in-up space-y-6">
                <div v-if="authStore.user?.has_password" class="space-y-1.5">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Lama</label>
                  <input v-model="oldPassword" type="password"
                    class="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold text-slate-700 outline-none" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Baru</label>
                    <input v-model="newPassword" type="password"
                      class="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold text-slate-700 outline-none" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Password</label>
                    <input v-model="confirmPassword" type="password"
                      class="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold text-slate-700 outline-none" />
                  </div>
                </div>
                <button @click="handleChangePassword" :disabled="isLoading"
                  class="w-full bg-primary text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-primary/20 text-xs uppercase tracking-widest">
                  {{ isLoading ? 'Memperbarui...' : 'Simpan Password Baru' }}
                </button>
              </div>
            </section>

            <!-- Bottom Note & Action -->
            <div class="pt-6 border-t border-slate-50 flex flex-col gap-6">
              <div v-if="errorMsg" class="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {{ errorMsg }}
              </div>

              <div class="flex items-center justify-end gap-3">
                <p v-if="!authStore.user" class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mr-auto">
                  Sesi Terbatas. Masuk untuk sinkronisasi.
                </p>

                <button v-if="authStore.user" @click="handleLogout"
                  class="px-8 py-3.5 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-600 transition-all">
                  Keluar
                </button>

                <button @click="handleClose" class="px-8 py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all">
                  Tutup Pengaturan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div v-if="isPreviewOpen && previewImage" class="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-[2.5rem] p-8 w-full max-w-sm flex flex-col items-center animate-fade-in-up shadow-2xl">
        <h3 class="text-lg font-bold text-gray-900 mb-6">Pratinjau Foto</h3>

        <div v-if="errorMsg" class="w-full text-xs text-red-600 bg-red-50 p-3 rounded-2xl border border-red-100 mb-6 animate-shake">
          {{ errorMsg }}
        </div>

        <div class="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-100 shadow-xl mb-8">
          <img :src="previewImage" class="w-full h-full object-cover" />
        </div>

        <div class="flex gap-3 w-full">
          <button @click="isPreviewOpen = false; errorMsg = ''" class="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors">
            Tutup Pratinjau
          </button>

          <button @click="handleUploadAvatar" :disabled="isLoading"
            class="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            {{ isLoading ? 'Menyimpan...' : 'Gunakan Foto' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>


<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
