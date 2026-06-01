<script setup lang="ts">
import { RouterView } from 'vue-router'
import NotificationToast from '@/components/UI/NotificationToast.vue'
import ConfirmModal from '@/components/Modals/ConfirmModal.vue'
import PointModal from '@/features/points/components/PointModal.vue'
import ProfileCompletionModal from '@/features/auth/components/ProfileCompletionModal.vue'
import UserProfileModal from '@/features/auth/components/UserProfileModal.vue'

</script>

<template>
  <RouterView />
  <NotificationToast />
  <ConfirmModal />
  <PointModal />
  <ProfileCompletionModal />
  <UserProfileModal />
</template>
