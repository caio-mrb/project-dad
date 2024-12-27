<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useLobbyStore } from '@/stores/lobby';
import { useGamesStore } from '@/stores/games';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

import ListGamesLobby from './ListGamesLobby.vue';
import Lobby from './Lobby.vue';
import Game from './Game.vue';

const storeLobby = useLobbyStore();
const storeGames = useGamesStore();
const storeAuth = useAuthStore();
const router = useRouter();

// State management
const isLoading = ref(true);
const error = ref(null);

// Authentication check
const isAuthenticated = computed(() => {
  return !!storeAuth.user && !!storeAuth.userId;
});

// Enhanced lobby status check with error handling
const isInGameLobby = computed(() => {
  if (!isAuthenticated.value) return false;
  
  try {
    return storeLobby.alreadyInAnyGameLobby();
  } catch (error) {
    console.error('Error checking game lobby status:', error);
    return false;
  }
});

// Enhanced current game computation with validation
const currentGame = computed(() => {
  if (!isAuthenticated.value) return null;
  
  try {
    const game = storeGames.getCurrentGame(storeAuth.userId);
    
    if (!game) return null;
    
    // Ensure game has required properties
    if (!game.hasImage) {
      return storeGames.setImages(game);
    }
    
    return game;
  } catch (error) {
    console.error('Error getting current game:', error);
    return null;
  }
});

// Authentication guard
const checkAuth = async () => {
  try {
    if (!isAuthenticated.value) {
        await router.push({ 
        name: 'login'
      });
      return false;
    }
    return true;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
};

// Initialize component
const initializeComponent = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // Check authentication first
    const isAuthed = await checkAuth();
    if (!isAuthed) return;

    // Fetch required data
    await Promise.all([
      storeLobby.fetchGames(),
      // Add other necessary data fetching here
    ]);

  } catch (err) {
    error.value = 'Failed to initialize game component';
    console.error('Initialization error:', err);
  } finally {
    isLoading.value = false;
  }
};

// Component lifecycle
onMounted(() => {
  initializeComponent();
});

// Watch for auth state changes
watchEffect(() => {
  if (!isAuthenticated.value && !isLoading.value) {
    checkAuth();
  }
});

// Error handling for child components
const handleComponentError = (componentName, error) => {
  console.error(`${componentName} error:`, error);
  // Add additional error handling logic here
};
</script>

<template>
  <div class="game-container">
    <!-- Error State -->
    <div v-if="error" class="flex justify-center items-center">
      <div class="p-4 w-fit rounded-lg bg-red-50 text-red-700">
        {{ error }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="flex justify-center items-center">
      <div class="p-16 w-fit rounded-lg bg-white">
        <div class="text-xl">Loading...</div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Game States -->
      <div v-if="isAuthenticated">
        <Lobby 
          v-if="isInGameLobby && !currentGame" 
          @error="(e) => handleComponentError('Lobby', e)"
        />
        <ListGamesLobby 
          v-else-if="!isInGameLobby && !currentGame"
          @error="(e) => handleComponentError('ListGamesLobby', e)"
        />
        <Game 
          v-else-if="currentGame && isInGameLobby"
          :game="currentGame"
          @error="(e) => handleComponentError('Game', e)"
        />
        
        <!-- No Active Game State -->
        <div v-else class="flex justify-center items-center">
          <div class="p-16 w-fit rounded-lg bg-white">
            <div class="text-xl">No active game found</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>