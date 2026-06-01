<script setup lang="ts">
defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95 translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 translate-y-4">
          <div v-if="show" class="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-white/20 relative z-10">
            <h3 class="text-2xl font-black text-slate-900 text-center tracking-tight mb-2">Keluar Aplikasi?</h3>
            <p class="text-slate-500 text-center font-medium text-sm leading-relaxed mb-8">
              Apakah Anda yakin ingin mengakhiri sesi ini? Anda perlu login kembali untuk mengakses fitur kontributor.
            </p>

            <div class="flex flex-col gap-3">
              <button @click="emit('confirm')" class="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-xs">
                Ya, Keluar Sekarang
              </button>
              <button @click="emit('cancel')" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-xs">
                Batalkan
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
