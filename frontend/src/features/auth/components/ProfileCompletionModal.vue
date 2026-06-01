<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const fullName = ref(authStore.user?.full_name || '')
const phone = ref('')
const isLoading = ref(false)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const submitProfile = async () => {
  if (!fullName.value || !phone.value) {
    notificationStore.warning("Harap lengkapi semua data.")
    return
  }

  isLoading.value = true
  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        full_name: fullName.value,
        phone: phone.value
      })
    })

    const result = await response.json()
    if (result.success && result.data) {
      authStore.user = result.data
      notificationStore.success("Terima kasih! Profil Anda berhasil dilengkapi.")
    } else {
      notificationStore.error(result.message || 'Gagal menyimpan profil.')
    }
  } catch (err) {
    console.error("Profile submit error:", err)
    notificationStore.error('Terjadi kesalahan koneksi.')
  } finally {
    isLoading.value = false
  }
}

</script>

<template>

  <div v-if="authStore.user && authStore.user.is_profile_completed === false" class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm px-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">

      <div class="bg-primary px-6 py-4 flex items-center justify-between">
        <h2 class="text-white font-bold text-lg">Lengkapi Profil Anda</h2>
      </div>


      <div class="p-6">
        <p class="text-sm text-gray-600 mb-5">
          Selamat datang <strong>{{ authStore.user?.full_name }}</strong>! <br />
          Untuk pengalaman yang lebih baik, kami memerlukan tambahan informasi kontak Anda. Kami jamin data Anda aman.
        </p>

        <form @submit.prevent="submitProfile" class="space-y-4">

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Nama Lengkap</label>
            <input v-model="fullName" type="text" placeholder="Masukkan nama lengkap Anda" required
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Nomor WhatsApp / HP</label>
            <input v-model="phone" type="tel" minlength="10" placeholder="08xxxxxxxxxx" required
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none" />
          </div>

          <div class="pt-4 flex justify-end">
            <button type="submit" :disabled="isLoading"
              class="bg-primary text-white font-bold py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50">
              {{ isLoading ? 'Menyimpan...' : 'Simpan Profil' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}
</style>
