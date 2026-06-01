import { defineStore } from 'pinia'
import { ref } from 'vue'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
  id: number
  message: string
  type: NotificationType
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  let nextId = 1

  const notify = (message: string, type: NotificationType = 'success') => {
    const id = nextId++
    notifications.value.push({ id, message, type })

    setTimeout(() => {
      remove(id)
    }, 5000)
  }
  
  const remove = (id: number) => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  const success = (message: string) => notify(message, 'success')
  const error = (message: string) => notify(message, 'error')
  const info = (message: string) => notify(message, 'info')
  const warning = (message: string) => notify(message, 'warning')

  return { notifications, notify, success, error, info, warning, remove }
})
