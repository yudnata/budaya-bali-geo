<script setup lang="ts">
import { ref } from 'vue'
import { usePointsStore } from '@/stores/pointsStore'
import type { GeoPoint } from '@/types/pointTypes'
import BlogEditor from '@/features/blog/components/BlogEditor.vue'

const props = defineProps<{
  modelValue: Partial<GeoPoint>
  blogContent: { title: string; content: string; cover_photo: string }
  activeTab: 'data' | 'blog'
}>()

const emit = defineEmits(['update:modelValue', 'update:blogContent'])

const store = usePointsStore()
const isUploading = ref(false)

const updateField = <K extends keyof GeoPoint>(field: K, value: GeoPoint[K]) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

const handleFileUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return

  isUploading.value = true
  const formData = new FormData()
  formData.append('image', target.files[0]!)
  formData.append('folder', 'points')

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    })
    const json = await res.json()
    if (json.success) {
      updateField('cover_image', json.data.url)
    }
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="p-6 overflow-y-auto w-full space-y-5 flex-1">
    <template v-if="activeTab === 'data'">

      <div class="space-y-1.5">
        <label class="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Nama Objek / Destinasi</label>
        <input :value="modelValue.name" @input="e => updateField('name', (e.target as HTMLInputElement).value)" type="text"
          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary transition-all text-sm font-bold text-slate-800 outline-none"
          placeholder="Nama objek wisata...">
      </div>

      <div class="space-y-1.5">
        <label class="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Kategori Objek</label>
        <select :value="modelValue.category_id" @change="e => updateField('category_id', parseInt((e.target as HTMLSelectElement).value))"
          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary transition-all text-sm font-bold text-slate-700 appearance-none outline-none">
          <option v-for="type in store.objectTypes" :value="type.id" :key="type.id">{{ type.name.toUpperCase() }}</option>
        </select>
      </div>

      <div class="space-y-1.5">
        <label class="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Estimasi Masa / Sejarah</label>
        <input :value="modelValue.tahun_berdiri" @input="e => updateField('tahun_berdiri', (e.target as HTMLInputElement).value)" type="text"
          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary transition-all text-sm font-bold text-slate-800 outline-none"
          placeholder="Contoh: Abad ke-14 atau Masa Kerajaan Majapahit">
      </div>

      <div class="space-y-1.5">
        <label class="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Foto Utama</label>
        <div class="flex gap-4 items-center">
          <div class="relative w-20 h-20 shrink-0">
            <div v-if="modelValue.cover_image" class="w-full h-full rounded-xl overflow-hidden border-2 border-primary/20">
              <img :src="modelValue.cover_image" class="w-full h-full object-cover">
            </div>
            <div v-else class="w-full h-full rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </div>
            <!-- Cover Upload Loading Spinner -->
            <div v-if="isUploading" class="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
              <div class="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          </div>

          <div class="flex-1">
            <input type="file" @change="handleFileUpload" class="hidden" id="photo-upload" accept="image/*">
            <label for="photo-upload"
              class="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50">
              {{ isUploading ? 'Mohon Tunggu...' : 'Ganti Foto Utama' }}
            </label>
            <p class="text-[10px] text-slate-400 mt-1">Gunakan foto terbaik sebagai cover destinasi.</p>
          </div>
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Alamat Lengkap</label>
        <textarea :value="modelValue.address" @input="e => updateField('address', (e.target as HTMLTextAreaElement).value)" rows="2"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary transition-all text-xs font-bold text-slate-600 outline-none"
          placeholder="Alamat objek..."></textarea>
      </div>

    </template>

    <template v-else>
      <BlogEditor :modelValue="blogContent.content" @update:modelValue="val => emit('update:blogContent', { ...blogContent, content: val })" />
    </template>

  </div>
</template>
