import { ref, onMounted, onUnmounted } from 'vue'

export function useEventListener(
  target: EventTarget,
  event: string,
  callback: EventListenerOrEventListenerObject,
) {
  onMounted(() => target.addEventListener(event, callback))
  onUnmounted(() => target.removeEventListener(event, callback))
}

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  useEventListener(window, 'mousemove', (event: Event) => {
    const mouseEvent = event as MouseEvent
    x.value = mouseEvent.pageX
    y.value = mouseEvent.pageY
  })

  return { x, y }
}
