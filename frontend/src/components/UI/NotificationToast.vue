<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications'

const store = useNotificationStore()
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[99999] flex flex-col-reverse gap-3 pointer-events-none">
    <TransitionGroup name="toast" tag="div" class="flex flex-col-reverse gap-3">
      <div v-for="n in store.notifications" :key="n.id" :class="[
        'pointer-events-auto min-w-[320px] max-w-md rounded-2xl p-4 flex items-start gap-4 transition-all duration-300 hover:scale-[1.02]',
        n.type === 'success' ? 'bg-emerald-500 text-white' :
          n.type === 'error' ? 'bg-rose-500 text-white' :
            n.type === 'warning' ? 'bg-amber-400 text-white' : 'bg-sky-500 text-white'
      ]">
        <!-- Icon Container -->
        <div :class="[
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          'bg-white/20 text-white'
        ]">
          <!-- Icons omitted for brevity, keeping existing icon logic -->
          <template v-if="n.type === 'success'">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </template>
          <template v-else-if="n.type === 'error'">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </template>
          <template v-else-if="n.type === 'warning'">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </template>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </template>
        </div>

        <!-- Content -->
        <div class="flex-1 pt-0.5">
          <h3 class="text-sm font-black text-white leading-none drop-shadow-sm">
            {{ n.type === 'success' ? 'Berhasil!' : n.type === 'error' ? 'Kesalahan' : n.type === 'warning' ? 'Peringatan' : 'Informasi' }}
          </h3>
          <p class="text-xs font-bold text-white/95 mt-1.5 leading-relaxed drop-shadow-sm">
            {{ n.message }}
          </p>
        </div>

        <!-- Close Button -->
        <button @click="store.remove(n.id)" class="p-1 text-white/60 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.toast-move {
  transition: transform 0.4s ease;
}
</style>
