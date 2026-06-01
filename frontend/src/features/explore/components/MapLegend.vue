<script setup lang="ts">
import { ref } from 'vue'
import { usePointsStore } from '@/stores/pointsStore'

const store = usePointsStore()
const isExpanded = ref(true)

import { getIconPath } from '@/constants/icons'

const colors = [

  '#2D6A4F', '#0077B6', '#D62828', '#F4A261', '#9D4EDD',
  '#FFB703', '#E63946', '#219EBC', '#023047', '#FB8500',
  '#8ECAE6', '#606C38'
]
</script>

<template>
  <div
    class="absolute bottom-16 right-6 z-[1000] bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 min-w-[140px] overflow-hidden transition-all duration-300">
    <div @click="isExpanded = !isExpanded" class="px-3 py-2.5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors group">
      <h4 class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Legenda Tipe</h4>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor"
        :class="['w-3 h-3 text-gray-400 group-hover:text-primary transition-transform duration-300', isExpanded ? '' : '-rotate-180']">
        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </div>

    <div v-show="isExpanded" class="p-3 space-y-2.5 max-h-[250px] overflow-y-auto transition-all duration-300">
      <div v-for="(type, index) in store.objectTypes" :key="type.id" class="flex items-center gap-2.5 group cursor-default">
        <div class="w-5 h-5 rounded-lg flex items-center justify-center text-white p-1 shadow-sm transition-transform group-hover:scale-110"
          :style="{ backgroundColor: colors[index % colors.length] }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
            <path :d="getIconPath(type.icon)" />
          </svg>
        </div>
        <span class="text-[10px] font-bold text-gray-600 tracking-tight uppercase">{{ type.name }}</span>
      </div>
    </div>
  </div>
</template>
