<script setup lang="ts">
import { useUIStore } from '@/stores/uiStore'

const uiStore = useUIStore()
</script>

<template>
  <div class="h-5 w-px bg-gray-300 shrink-0"></div>

  <div class="flex bg-gray-200/80 rounded-xl p-0.5 shrink-0 h-9 items-center">
    <button @click="uiStore.statusFilter = 'all'" :class="uiStore.statusFilter === 'all' ? 'bg-white shadow-md text-primary font-extrabold' : 'text-gray-500 hover:text-gray-700'"
      class="px-3 h-7 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap">Semua</button>
    <button @click="uiStore.statusFilter = 'draft'" :class="uiStore.statusFilter === 'draft' ? 'bg-white shadow-md text-primary font-extrabold' : 'text-gray-500 hover:text-gray-700'"
      class="px-3 h-7 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap">Draft</button>
    <button @click="uiStore.statusFilter = 'approved'" :class="uiStore.statusFilter === 'approved' ? 'bg-white shadow-md text-primary font-extrabold' : 'text-gray-500 hover:text-gray-700'"
      class="px-3 h-7 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap">Verif</button>
  </div>

  <div class="flex items-center gap-2.5 h-9 px-3 rounded-xl border border-gray-300 bg-white cursor-pointer shrink-0" @click="uiStore.toggleEditMode()">
    <span class="text-[11px] font-bold uppercase tracking-wider select-none" :class="uiStore.isEditMode ? 'text-emerald-700' : 'text-gray-500'">Edit</span>
    <div :class="[
      'relative w-11 h-6 rounded-full transition-colors duration-300 shadow-inner',
      uiStore.isEditMode ? 'bg-emerald-500' : 'bg-gray-300'
    ]">
      <div :class="[
        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300',
        uiStore.isEditMode ? 'left-[22px]' : 'left-0.5'
      ]"></div>
    </div>
  </div>
</template>
