<script setup>
import userPicture from '@/assets/avatar/avatar-none.png';
import { ref, onMounted, useTemplateRef, provide, computed, onUpdated } from 'vue';
import Toaster from './components/ui/toast/Toaster.vue';
import { useAuthStore } from '@/stores/auth'
import GlobalAlertDialog from '@/components/common/GlobalAlertDialog.vue'

const storeAuth = useAuthStore();

const navbar = ref(null);
const navbarHeight = ref(0);

// Controle do menu mobile
const isMobileMenuOpen = ref(false);

// Controle do dropdown do perfil
const isDropdownOpen = ref(false);

// Variável para armazenar a largura da janela
const windowWidth = ref(window.innerWidth);

// Função para atualizar a largura da janela
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

// Fecha o dropdown ao clicar fora
const handleClickOutside = (event) => {
  const dropdownMenu = document.getElementById('user-menu');
  const userMenuButton = document.getElementById('user-menu-button');
  if (dropdownMenu != null && userMenuButton != null && !dropdownMenu.contains(event.target) && !userMenuButton.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

const alertDialog = useTemplateRef('alert-dialog')
provide('alertDialog', alertDialog)

const logoutConfirmed = () => {
  storeAuth.logout()
}

const logout = () => {
  alertDialog.value.open(logoutConfirmed,
    'Logout confirmation?', 'Cancel', `Yes, I want to log out`,
    `Are you sure you want to log out? You can still access your account later with
    your credentials.`)
}

const deleteAccount = () => {
  alertDialog.value.open(logoutConfirmed,
    'Logout confirmation?', 'Cancel', `Yes, I want to log out`,
    `Are you sure you want to log out? If yes please type "DELETE" below.`)
}

// Computed para determinar se está em modo `sm` ou não
const isSmScreen = computed(() => windowWidth.value < 640);

const updateNavbarHeight = () => {
  if (navbar.value) {
    navbarHeight.value = navbar.value.offsetHeight + 64;
  }
};

onMounted(() => {
  updateNavbarHeight();
  provide('navbarHeight', navbarHeight);
  window.addEventListener('resize', updateWindowWidth);
  window.addEventListener('resize', updateNavbarHeight); 
  document.addEventListener('click', handleClickOutside);
});

</script>

<template>
  <Toaster />
  <GlobalAlertDialog ref="alert-dialog"></GlobalAlertDialog>
  <div class="min-h-screen bg-purple-500 bg-[url('/bg-tile.png')] bg-repeat">
    <header class="bg-white shadow-md" ref="navbar">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="bg-white">
          <div class="relative flex h-16 items-center justify-between">
            <!-- Mobile menu button -->
            <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <button type="button"
                class="relative inline-flex items-center justify-center rounded-md p-2 text-black hover:bg-purple-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-200"
                @click="isMobileMenuOpen = !isMobileMenuOpen" :aria-expanded="isMobileMenuOpen.toString()">
                <span class="sr-only">Open main menu</span>
                <svg v-if="!isMobileMenuOpen" class="block size-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                <svg v-else class="block size-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Logo and Desktop Menu -->
            <div class="flex flex-1 items-center h-16 justify-center sm:items-stretch sm:justify-start">
              <div class="flex shrink-0 items-center">
                <RouterLink :to="{ name: 'Home' }">
                  <img class="h-12 w-auto" src="/logo.svg" alt="Memory Game Logo">
                </RouterLink>
              </div>
              <div class="hidden sm:ml-6 sm:block">
                <div class="flex space-x-4 h-16 items-center">
                  <RouterLink :to="{ name: 'Home' }"
                    class="text-gray-900 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    active-class="text-purple-600 font-semibold">
                    Home
                  </RouterLink>

                  <RouterLink v-if="storeAuth.user && storeAuth.userType == 'P'" :to="{ name: 'shop' }"
                    class="text-gray-900 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    active-class="text-purple-600 font-semibold">
                    Shop
                  </RouterLink>

                  <RouterLink :to="{ name: 'statistics' }"
                    class="text-gray-900 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    active-class="text-purple-600 font-semibold">
                    Statistics
                  </RouterLink>

                  <RouterLink :to="{ name: 'GlobalScoreboard' }"
                    class="text-gray-900 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    active-class="text-purple-600 font-semibold">
                    LeaderBoards
                  </RouterLink>
                </div>
              </div>
            </div>

            <!-- Notifications, Profile and Name-->
            <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">

              <!-- Profile dropdown -->
              <h2 v-if="storeAuth.user && storeAuth.userType == 'P'"
                class="hidden sm:block font-semibold text-1xl text-purple-600 ">{{ storeAuth.userBalance }} Braincoins
              </h2>
              <div class="relative ml-3">
                <div>
                  <template v-if="!storeAuth.user && !isSmScreen">
                    <RouterLink :to="{ name: 'login' }"
                      class="max-h-10 h-auto relative flex h-full rounded-full bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 focus:ring-offset-white"
                      active-class="text-purple-600 font-semibold">
                      <span class="sr-only">Open user menu</span>
                      <img class="size-10 rounded-full" :src="storeAuth.user ? storeAuth.userPhotoUrl : userPicture"
                        alt="">
                      <p
                        class="text-gray-900 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        {{ storeAuth.user ? storeAuth.userNickname : 'Login' }}
                      </p>
                    </RouterLink>
                  </template>

                  <template v-else>
                    <button type="button"
                      class="max-h-10 h-auto relative flex rounded-full bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 focus:ring-offset-white"
                      id="user-menu-button" @click="isDropdownOpen = !isDropdownOpen">
                      <span class="sr-only">Open user menu</span>
                      <img class="size-10 rounded-full" :src="storeAuth.userPhotoUrl" alt="">
                      <h1 class="text-gray-900 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        {{ storeAuth.user ? storeAuth.userNickname : 'Login' }}
                      </h1>
                    </button>
                  </template>

                </div>
                <div v-show="isDropdownOpen"
                  class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg focus:outline-none"
                  role="menu" aria-orientation="vertical" tabindex="-1" id="user-menu">
                  <RouterLink v-if="!storeAuth.user" :to="{ name: 'login' }"
                    class="font-semibold text-2xl pb-8 text-center sm:hidden max-h-10 h-auto text-purple-600 hover:text-purple-300 transition-colors block">
                    Login</RouterLink>

                  <div v-else>
                    <h1 class="font-semibold text-2xl pb-8 text-center sm:hidden max-h-10 h-auto text-purple-600 block">
                      {{ storeAuth.userNickname }}
                    </h1>
                    <h2 v-if="storeAuth.userType == 'P'"
                      class="sm:hidden font-semibold text-1xl text-purple-600 text-right pr-4">{{
                      storeAuth.userBalance }} Braincoins</h2>
                  </div>



                  <div v-if="storeAuth.user">
                    <RouterLink :to="{ name: 'profile' }"
                      class="block text-gray-900 hover:text-purple-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      active-class="text-purple-600 font-semibold">
                      Profile
                    </RouterLink>
                    <RouterLink v-if="storeAuth.userType == 'P'" :to="{ name: 'MatchHistorySingle' }"
                      class="block text-gray-900 hover:text-purple-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      active-class="text-purple-600 font-semibold">
                      Match History
                    </RouterLink>
                    <RouterLink v-if="storeAuth.userType == 'P'" :to="{ name: 'TransactionHistory' }"
                      class="block text-gray-900 hover:text-purple-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      active-class="text-purple-600 font-semibold">
                      Transactions History
                    </RouterLink>
                    <RouterLink v-if="storeAuth.userType == 'P'" :to="{ name: 'PersonalScoreboard' }"
                      class="block text-gray-900 hover:text-purple-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      active-class="text-purple-600 font-semibold">
                      Scoreboard
                    </RouterLink>
                    <button @click="logout"
                      class="block text-gray-900 font-semibold hover:text-purple-300 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-show="isMobileMenuOpen" class="sm:hidden" id="mobile-menu">
            <div class="space-y-1 px-2 pb-3 pt-2">
              <RouterLink :to="{ name: 'Home' }"
                class="block text-gray-900 hover:text-purple-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                active-class="text-purple-600 font-semibold">
                Home
              </RouterLink>

              <RouterLink v-if="storeAuth.user && storeAuth.userType == 'P'" :to="{ name: 'shop' }"
                class="block text-gray-900 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                active-class="text-purple-600 font-semibold">
                Shop
              </RouterLink>

              <RouterLink :to="{ name: 'statistics' }"
                class="block text-gray-900 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                active-class="text-purple-600 font-semibold">
                Statistics
              </RouterLink>

              <RouterLink :to="{ name: 'GlobalScoreboard' }"
                class="block text-gray-900 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                active-class="text-purple-600 font-semibold">
                LeaderBoards
              </RouterLink>
            </div>
          </div>

        </nav>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterView />
    </main>
  </div>
</template>
