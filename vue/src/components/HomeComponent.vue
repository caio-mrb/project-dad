<script setup>
import { useAuthStore } from '@/stores/auth'
const storeAuth = useAuthStore()

</script>


<template>
    <div class="flex flex-col items-center text-center space-y-8 py-12">
        <div class="w-1/2 min-w-96 px-4">
            <img src="/logo.svg" alt="Memory Game Logo" class="w-full h-auto object-contain mx-auto" />
        </div>

        <div class="max-w-2xl mx-auto px-4 space-y-4">
            <RouterLink v-if="storeAuth.userType == 'A'" to="/signup"
                class="text-white hover:text-purple-300 px-3 py-2 rounded-full text-sm font-medium transition-colors bg-purple-700 block"
                active-class="text-blue-600 font-semibold">
                Create New Admin Account
            </RouterLink>

            <RouterLink v-if="storeAuth.userType == 'A'" to="/ListOfPlayers"
                class="text-white hover:text-purple-300 px-3 py-2 rounded-full text-sm font-medium transition-colors bg-purple-700 block"
                active-class="text-blue-600 font-semibold">
                List of Players and Admins
            </RouterLink>

            <RouterLink v-if="storeAuth.userType != 'A'" :to="{name: 'SinglePlayerBoardSize'}"
                class="text-white hover:text-purple-300 px-3 py-2 rounded-full text-sm font-medium transition-colors bg-purple-700 block"
                active-class="text-blue-600 font-semibold">
                Singleplayer
            </RouterLink>

            <RouterLink v-if="storeAuth.user && storeAuth.userType != 'A'" :to="{name: 'MultiPlayerGame'}"
                class="text-white hover:text-purple-300 px-3 py-2 rounded-full text-sm font-medium transition-colors bg-purple-700 block"
                active-class="text-blue-600 font-semibold">
                Multiplayer
            </RouterLink>

            <RouterLink v-if="storeAuth.user && storeAuth.userType == 'P'" to="shop"
                class="text-white hover:text-purple-300 px-3 py-2 rounded-full text-sm font-medium transition-colors bg-purple-700 block"
                active-class="text-blue-600 font-semibold">
                Buy Coins
            </RouterLink>

            <RouterLink to="statistics"
                class="text-white hover:text-purple-300 px-3 py-2 rounded-full text-sm font-medium transition-colors bg-purple-700 block"
                active-class="text-blue-600 font-semibold">
                Statistics
            </RouterLink>

            <RouterLink to="GlobalScoreboard" 
            class="text-white hover:text-purple-300 px-3 py-2 rounded-full text-sm font-medium transition-colors bg-purple-700 block"
            ctive-class="text-blue-600 font-semibold"
            >
                LeaderBoards
            </RouterLink>
        </div>

    </div>
</template>