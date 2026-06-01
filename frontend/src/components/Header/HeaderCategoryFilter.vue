<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePointsStore } from '@/stores/pointsStore'
import { useUIStore } from '@/stores/uiStore'


const store = usePointsStore()
const uiStore = useUIStore()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const selectedCategory = computed(() => {
  if (!uiStore.filterTypeId) return null
  return store.objectTypes.find(t => t.id === uiStore.filterTypeId)
})

const selectCategory = (id: number | null) => {
  uiStore.filterTypeId = id
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

</script>

<template>
  <div class="relative shrink-0" ref="dropdownRef">
    <!-- Trigger Button -->
    <button @click="isOpen = !isOpen" class="h-10 px-4 bg-white border border-gray-100 rounded-xl flex items-center gap-3 transition-all hover:bg-gray-50 active:scale-95 shadow-sm min-w-[160px]">
      <span class="text-[10px] font-black text-gray-700 uppercase tracking-widest truncate flex-1 text-left">
        {{ selectedCategory ? selectedCategory.name : 'Semua Kategori' }}
      </span>


      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor"
        :class="['w-3 h-3 text-gray-400 transition-transform duration-300', isOpen ? 'rotate-180' : '']">
        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <Transition name="slide-up">
      <div v-if="isOpen"
        class="absolute top-full mt-2 left-0 right-0 min-w-[200px] bg-white/90 backdrop-blur-xl border border-white rounded-2xl shadow-2xl overflow-hidden z-[1100] py-1.5 animate-in fade-in zoom-in-95 duration-200">
        <button @click="selectCategory(null)"
          :class="['w-full px-5 py-2.5 text-left flex items-center transition-colors hover:bg-gray-50', !uiStore.filterTypeId ? 'bg-primary/5 text-primary' : 'text-gray-600']">
          <span class="text-[10px] font-black uppercase tracking-widest">Semua Kategori</span>
        </button>

        <div class="h-px bg-gray-100 my-1 mx-2"></div>

        <button v-for="type in store.objectTypes" :key="type.id" @click="selectCategory(type.id)"
          :class="['w-full px-5 py-2.5 text-left flex items-center transition-colors hover:bg-gray-50', uiStore.filterTypeId === type.id ? 'bg-primary/5 text-primary' : 'text-gray-600']">
          <span class="text-[10px] font-black uppercase tracking-widest">{{ type.name }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
