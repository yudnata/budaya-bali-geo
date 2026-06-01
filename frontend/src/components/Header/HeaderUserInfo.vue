<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/uiStore'

const authStore = useAuthStore()
const uiStore = useUIStore()

const avatarError = ref(false)
watch(() => authStore.user, () => {
  avatarError.value = false
})
</script>

<template>
  <div class="flex items-center gap-2">
    <div v-if="authStore.user" class="flex items-center gap-2">
      <div @click="uiStore.openProfileModal()"
        class="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
        <div class="text-right hidden sm:block">
          <p class="text-xs font-bold text-gray-900 leading-tight">{{ authStore.user.full_name }}</p>

          <p class="text-[10px] text-gray-400 font-medium">{{ authStore.user.email || 'Administrator' }}</p>
        </div>

        <div class="relative">
          <img v-if="authStore.user.avatar_url && !avatarError" :src="authStore.user.avatar_url" class="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
            @error="avatarError = true" />
          <img v-else :src="authStore.defaultAvatarUrl" class="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover" />
          <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
      </div>
    </div>

    <div v-else class="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
      <p class="text-xs font-bold text-gray-500 hidden sm:block">Guest</p>
      <img :src="authStore.defaultAvatarUrl" class="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover" />
    </div>

    <RouterLink v-if="!authStore.user" to="/login"
      class="px-5 py-2 bg-primary text-white text-[10px] font-bold rounded-full hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 tracking-tighter uppercase">
      Login
    </RouterLink>
  </div>
</template>
