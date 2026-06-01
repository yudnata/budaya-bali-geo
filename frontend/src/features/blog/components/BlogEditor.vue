<script setup lang="ts">
import { ref } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import BlotFormatter from 'quill-blot-formatter'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

const isBlogImageUploading = ref(false)
const quillRef = ref()
const cursorBounds = ref<{ top: number; left: number } | null>(null)

const modules = {
  name: 'blotFormatter',
  module: BlotFormatter,
}

const uploadImageToCloudinary = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('folder', 'blogs')

    isBlogImageUploading.value = true

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) resolve(json.data.url)
        else resolve(null)
      })
      .catch(() => resolve(null))
      .finally(() => {
        isBlogImageUploading.value = false
        cursorBounds.value = null
      })
  })
}

const updateCursorBounds = () => {
  const quill = quillRef.value?.getQuill()
  if (!quill) return
  const range = quill.getSelection(true)
  if (range) {
    cursorBounds.value = quill.getBounds(range.index)
  }
}

const imageHandler = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.click()

  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return

    updateCursorBounds()
    const url = await uploadImageToCloudinary(file)
    if (!url) return

    const quill = quillRef.value?.getQuill()
    if (!quill) return

    const range = quill.getSelection(true)
    quill.insertEmbed(range.index, 'image', url)
    quill.setSelection(range.index + 1)
  }
}

const onEditorReady = () => {
  const quill = quillRef.value?.getQuill()
  if (!quill) return

  quill.getModule('toolbar').addHandler('image', imageHandler)

  quill.root.addEventListener('paste', async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of Array.from(items)) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          updateCursorBounds()
          const url = await uploadImageToCloudinary(file)
          if (url) {
            const range = quill.getSelection(true)
            quill.insertEmbed(range.index, 'image', url)
            quill.setSelection(range.index + 1)
          }
        }
      }
    }
  }, false)

  quill.root.addEventListener('drop', async (e: DragEvent) => {
    const files = e.dataTransfer?.files
    if (!files?.length) return

    for (const file of Array.from(files)) {
      if (file.type.indexOf('image') !== -1) {
        e.preventDefault()
        updateCursorBounds()
        const url = await uploadImageToCloudinary(file)
        if (url) {
          const range = quill.getSelection(true)
          quill.insertEmbed(range.index, 'image', url)
          quill.setSelection(range.index + 1)
        }
      }
    }
  }, false)
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 relative">
    <div class="flex-1 flex flex-col border border-slate-200 rounded-2xl bg-white relative shadow-inner">

      <!-- Precision Loading Spinner at Cursor -->
      <div v-if="isBlogImageUploading && cursorBounds"
        class="absolute z-50 pointer-events-none flex items-center gap-2 px-2 py-1 bg-white/80 backdrop-blur shadow-sm rounded-lg border border-primary/20" :style="{
          top: `${cursorBounds.top + (quillRef?.getQuill()?.container?.querySelector('.ql-toolbar')?.offsetHeight || 0) + 20}px`,
          left: `${cursorBounds.left + 20}px`
        }">
        <div class="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <span class="text-[9px] font-black text-primary uppercase tracking-widest">Uploading...</span>
      </div>

      <QuillEditor ref="quillRef" :content="modelValue" contentType="html" @update:content="val => emit('update:modelValue', val)" @ready="onEditorReady" theme="snow" :toolbar="[
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['image', 'link', 'clean']
      ]" :modules="modules" placeholder="Tuliskan ulasan mendalam tentang destinasi ini..." class="flex-1 overflow-hidden flex flex-col" />
    </div>
  </div>
</template>

<style>
/* CSS khusus untuk Editor agar Toolbar Tetap di Atas dan Area Tulis Scroll */
.ql-toolbar.ql-snow {
  border: none !important;
  border-bottom: 1px solid #e2e8f0 !important;
  background: rgba(248, 250, 252, 0.8) !important;
  backdrop-filter: blur(8px);
  padding: 10px 15px !important;
  flex-shrink: 0;
  z-index: 40 !important;
  position: sticky !important;
  top: 0;
  border-radius: 16px 16px 0 0 !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.ql-container.ql-snow {
  border: none !important;
  font-family: 'Urbanist', sans-serif;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ql-editor {
  flex: 1;
  overflow-y: auto !important;
  padding: 30px !important;
  line-height: 1.8 !important;
}

.ql-editor::-webkit-scrollbar {
  width: 6px;
}

.ql-editor::-webkit-scrollbar-track {
  background: transparent;
}

.ql-editor::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.prose-bali,
.ql-editor {
  font-family: 'Urbanist', sans-serif !important;
  font-size: 16px !important;
  color: #334155 !important;
}

.prose-bali h1,
.ql-editor h1 {
  font-size: 2.25rem !important;
  font-weight: 800 !important;
  margin-top: 1.5rem !important;
  margin-bottom: 1rem !important;
  letter-spacing: -0.025em !important;
  color: #0f172a !important;
}

.prose-bali h2,
.ql-editor h2 {
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  margin-top: 1.25rem !important;
  margin-bottom: 0.75rem !important;
  color: #1e293b !important;
}

.prose-bali p,
.ql-editor p {
  margin-bottom: 1.25rem !important;
}
</style>
