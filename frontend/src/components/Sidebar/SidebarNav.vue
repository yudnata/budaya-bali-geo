<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()

const authStore = useAuthStore()


const explorerItems = [
  {
    path: '/',
    name: 'Beranda',
    icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  },
  {
    path: '/explore',
    name: 'Peta Eksplorasi',
    icon: 'M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z',
  },
]

const contributionItems = computed(() => {
  if (!authStore.user || authStore.isAdmin()) return []
  return [

    {
      path: '/dashboard',
      name: 'Kontribusi Saya',
      icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125',
    },

    {
      path: '/contributor/dashboard',
      name: 'Status Kontribusi',
      icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
    },
  ]
})

const managementItems = computed(() => {
  const items = [
    {
      path: '/tabular',
      name: 'Pustaka Data',
      icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 011.875 1.875v11.25a1.875 1.875 0 01-1.875 1.875H5.625a1.875 1.875 0 01-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V6.375c0-1.036.84-1.875 1.875-1.875z',
    }
  ]

  if (authStore.isAdmin()) {
    items.push(
      {
        path: '/admin/verification',
        name: 'Verifikasi',
        icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      {
        path: '/admin/categories',
        name: 'Kategori',
        icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.659A2.25 2.25 0 009.568 3z',
      },
      {
        path: '/admin/users',
        name: 'Pengguna',
        icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-2.533-4.656c-1.259-.27-2.537-.442-3.837-.514M18 7.5a3 3 0 11-6 0 3 3 0 016 0zm-9.75 4.5c.372 0 .742.01 1.109.03m0 0a11.011 11.011 0 014.121-.952 4.125 4.125 0 014.058 3.035M9.75 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-9 4.5a11.011 11.011 0 014.121-.952 4.125 4.125 0 014.058 3.035m0 0a11.011 11.011 0 014.121-.952M9.75 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-9 4.5a11.011 11.011 0 014.121-.952 4.125 4.125 0 014.058 3.035m0 0a11.011 11.011 0 014.121-.952',
      }
    )
  }

  return items
})

const isItemActive = (path: string) => {
  return route.path === path
}
</script>

<template>
  <nav class="flex-1 py-6 space-y-1 overflow-y-auto overflow-x-hidden flex flex-col">
    <!-- Combined Navigation Items -->

    <!-- Explorer Items -->
    <RouterLink v-for="item in explorerItems" :key="item.path" :to="item.path" :class="[
      'flex items-center transition-all duration-300 group/item h-12 pl-0 pr-3 gap-3 overflow-hidden rounded-r-2xl rounded-l-none mr-3',
      isItemActive(item.path)
        ? 'bg-primary text-white'
        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600',
    ]" :title="item.name">
      <div class="w-10 h-10 ml-3 flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
        </svg>
      </div>
      <span class="text-[11px] font-bold whitespace-nowrap tracking-tight uppercase transition-opacity duration-300 opacity-0 group-hover:opacity-100">
        {{ item.name }}
      </span>
    </RouterLink>

    <!-- Contribution Items -->
    <template v-if="authStore.user && !authStore.isAdmin()">
      <RouterLink v-for="item in contributionItems" :key="item.path" :to="item.path" :class="[
        'flex items-center transition-all duration-300 group/item h-12 pl-0 pr-3 gap-3 overflow-hidden rounded-r-2xl rounded-l-none mr-3',
        isItemActive(item.path)
          ? 'bg-primary text-white'
          : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600',
      ]" :title="item.name">
        <div class="w-10 h-10 ml-3 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
          </svg>
        </div>
        <span class="text-[11px] font-bold whitespace-nowrap tracking-tight uppercase transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          {{ item.name }}
        </span>
      </RouterLink>
    </template>

    <!-- Management Items -->
    <template v-if="authStore.user">
      <RouterLink v-for="item in managementItems" :key="item.path" :to="item.path" :class="[
        'flex items-center transition-all duration-300 group/item h-12 pl-0 pr-3 gap-3 overflow-hidden rounded-r-2xl rounded-l-none mr-3',
        isItemActive(item.path)
          ? 'bg-primary text-white'
          : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600',
      ]" :title="item.name">
        <div class="w-10 h-10 ml-3 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
          </svg>
        </div>
        <span class="text-[11px] font-bold whitespace-nowrap tracking-tight uppercase transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          {{ item.name }}
        </span>
      </RouterLink>
    </template>
  </nav>
</template>
