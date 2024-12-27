<script setup>
import { inject } from 'vue';
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router';
import ThemedAlertDialog from '@/components/ui/themed-alert-dialog/ThemedAlertDialog.vue';
const storeAuth = useAuthStore()
const navbarHeight = inject('navbarHeight', 0);

const router = useRouter();

const handle4x4Confirm = () => {
    router.push({ name: 'SinglePlayerGame', params: { id: '2' } });
};

const handle6x6Confirm = () => {
    router.push({ name: 'SinglePlayerGame', params: { id: '3' } });
};

</script>

<template>
    <div :style="{ height: `calc(100vh - ${navbarHeight}px)` }"
      class="flex flex-col items-center justify-center text-center space-y-8">
      
      <!-- Trigger for 3x4 Game -->
      <RouterLink :to="{ name: 'SinglePlayerGame', params: { id: '1' } }"
        class="text-white hover:text-purple-300 px-3 py-2 rounded-full text-sm w-44 font-medium transition-colors bg-purple-700"
        active-class="text-blue-600 font-semibold">
        3x4
      </RouterLink>
  
      <!-- Dialog for 4x4 Game -->
      <ThemedAlertDialog v-if="storeAuth.user && storeAuth.userType == 'P'"
        :title="storeAuth.userBalance <= 0 ? 'You don\'t have enough Braincoins' : 'Spend one Braincoin?'"
        :description="storeAuth.userBalance <= 0
          ? 'You need at least one Braincoin to play this game.'
          : 'This will permanently use one coin and will not return even if the game is not finished.'"
        :confirmText="storeAuth.userBalance <= 0 ? 'Ok' : 'Let\'s Play'"
        :cancelText="storeAuth.userBalance <= 0 ? '' : 'Cancel'"
        :onConfirm="storeAuth.userBalance <= 0 ? null : handle4x4Confirm">
        <template #trigger>
          4x4
        </template>
      </ThemedAlertDialog>
  
      <!-- Dialog for 6x6 Game -->
      <ThemedAlertDialog v-if="storeAuth.user && storeAuth.userType == 'P'"
        :title="storeAuth.userBalance <= 0 ? 'You don\'t have enough Braincoins' : 'Spend one Braincoin?'"
        :description="storeAuth.userBalance <= 0
          ? 'You need at least one Braincoin to play this game.'
          : 'This will permanently use one coin and will not return even if the game is not finished.'"
        :confirmText="storeAuth.userBalance <= 0 ? 'Ok' : 'Let\'s Play'"
        :cancelText="storeAuth.userBalance <= 0 ? '' : 'Cancel'"
        :onConfirm="storeAuth.userBalance <= 0 ? null : handle6x6Confirm">
        <template #trigger>
          6x6
        </template>
      </ThemedAlertDialog>
  
    </div>
  </template>
