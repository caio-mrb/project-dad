<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Board from './Board.vue';
import { useMemoryGame } from './memorygame';
import { useDateUtils } from '@/stores/date';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const storeAuth = useAuthStore();
const { formatDateToISO } = useDateUtils();
const boardId = route.params.id;

// State management
const isLoading = ref(true);
const error = ref(null);
const gameInitialized = ref(false);
const gameDB = ref(null);
const boardSize = ref({ rows: 0, cols: 0 });

// Computed properties
const isPaidGame = computed(() => ['2', '3'].includes(boardId));
const isValidGame = computed(() => isPaidGame.value || boardId === '1');
const isUserAuthorized = computed(() => storeAuth.user && storeAuth.userType === 'P');
const hasEnoughCoins = computed(() => storeAuth.userBalance > 0);
const rows = computed(() => boardSize.value?.rows || 0);
const cols = computed(() => boardSize.value?.cols || 0);

// Game state management
const gameState = ref(null);

// API Handlers
const api = {
  async fetchBoardSize() {
    try {
      const response = await axios.get(`/boards/${boardId}`);
      boardSize.value = response.data.data;
      return true;
    } catch (err) {
      console.error('Error fetching board size:', err);
      error.value = 'Failed to load board configuration';
      router.push({ name: 'SinglePlayerBoardSize' });
      return false;
    }
  },

  async createGame() {
    if (!isUserAuthorized.value) return true;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push({ name: 'login' });
        return false;
      }

      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      const response = await axios.post('games', {
        type: 'S',
        status: 'PL',
        began_at: formatDateToISO(new Date()),
        board_id: boardId
      });

      gameDB.value = response.data.data;
      return true;
    } catch (err) {
      console.error('Game creation failed:', err);
      error.value = 'Failed to create game';
      router.push({ name: 'SinglePlayerBoardSize' });
      return false;
    }
  },

  async handleTransaction() {
    if (!isPaidGame.value) return true;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push({ name: 'login' });
        return false;
      }

      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      await axios.post('transactions', {
        transaction_datetime: formatDateToISO(new Date()),
        user_id: storeAuth.userId,
        game_id: gameDB.value.id,
        type: 'I',
        brain_coins: -1
      });

      storeAuth.removeBrainCoins(1);
      return true;
    } catch (err) {
      console.error('Transaction failed:', err);
      error.value = 'Transaction failed';
      router.push({ name: 'SinglePlayerBoardSize' });
      return false;
    }
  },

  async updateGameStatus(status, endData = null) {
    if (!isUserAuthorized.value || !gameDB.value?.id) return true;

    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      
      if (status === 'E' && endData) {
        await axios.put(`/games/${gameDB.value.id}`, {
          status,
          ended_at: formatDateToISO(endData.endedAt),
          total_time: endData.totalTime,
          total_turns_winner: endData.totalTurns
        });
      } else {
        await axios.patch(`/games/${gameDB.value.id}`, { status });
      }
      
      return true;
    } catch (err) {
      console.error('Failed to update game status:', err);
      return false;
    }
  }
};

// Game Logic
const initializeGameLogic = () => {
  gameState.value = useMemoryGame(rows.value, cols.value);
  
  watch(() => gameState.value.isGameOver, async (newVal, oldVal) => {
    if (newVal && !oldVal) {
      const endTime = new Date();
      await api.updateGameStatus('E', {
        endedAt: endTime,
        totalTime: gameState.value.elapsedTime,
        totalTurns: gameState.value.turnCount
      });
      clearInterval(gameState.value.timerInterval.value);
    }
  });
};

// Validation Handlers
const validators = {
  checkAuthAndAuthorization() {
    if ((isUserAuthorized.value || !isPaidGame.value) && isValidGame.value) {
      return true;
    }
    router.push({ name: 'login' });
    return false;
  },

  checkBalance() {
    if (hasEnoughCoins.value || !isPaidGame.value) {
      return true;
    }
    router.push({ name: 'SinglePlayerBoardSize' });
    return false;
  }
};

// Game Initialization
const initializeGame = async () => {
  isLoading.value = true;
  error.value = null;
  gameInitialized.value = false;

  try {
    if (!validators.checkAuthAndAuthorization()) return;
    if (!validators.checkBalance()) return;
    if (!await api.fetchBoardSize()) return;
    if (!await api.createGame()) return;
    if (!await api.handleTransaction()) return;

    initializeGameLogic();
    gameState.value.resetGame();
    gameInitialized.value = true;
  } catch (err) {
    error.value = 'Failed to initialize game';
    console.error('Game initialization failed:', err);
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle Hooks
onMounted(() => {
  initializeGame();
});

// Route Guards
router.beforeEach(async (to, from, next) => {
  if (from.name === 'SinglePlayerGame') {
    if (!gameState.value?.isGameOver) {
      await api.updateGameStatus('I');
    }
  }
  next();
});

// Route Watcher
watch(() => route.params.id, initializeGame);
</script>

<template>
  <div class="relative w-full max-w-7xl mx-auto px-4">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center">
      <div class="p-16 w-fit rounded-lg bg-white">
        <div class="text-xl">Loading game...</div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex justify-center items-center p-16">
      <div class="text-red-500 bg-white rounded-lg p-4">{{ error }}</div>
    </div>

    <!-- Game content -->
    <template v-else-if="gameState && gameInitialized">
      <div v-if="!gameState.isGameOver" class="flex flex-col items-center">
        <!-- Stats bar -->
        <div class="w-full max-w-2xl mb-8">
          <div class="flex justify-between items-center text-md">
            <div class="p-4 bg-white rounded-lg shadow-md">
              <strong class="mr-2">Turns:</strong>
              <span class="font-bold">{{ gameState.turnCount }}</span>
            </div>
            <div class="p-4 bg-white rounded-lg shadow-md">
              <strong class="mr-2">Time:</strong>
              <span class="font-bold">{{ gameState.formattedTime }}</span>
            </div>
          </div>
        </div>

        <!-- Game board -->
        <Board 
          :game-board="gameState.gameBoard" 
          :dimensions="boardSize"
          :on-flip-card="gameState.flipCard" 
        />
      </div>

      <!-- Game over screen -->
      <div v-else class="flex flex-col items-center justify-center mt-8 p-6 bg-white rounded-lg shadow-md">
        <strong class="text-xl">You Won!</strong>
        <p class="mt-2 mb-4">
          You've completed the game in {{ gameState.formattedTime }} and {{ gameState.turnCount }} turns.
        </p>
        <RouterLink 
          :to="{ name: 'Home' }"
          class="text-white hover:text-purple-300 px-3 py-2 rounded-full text-sm w-fit font-medium transition-colors bg-purple-700 block"
          active-class="text-blue-600 font-semibold"
        >
          Home
        </RouterLink>
      </div>
    </template>
  </div>
</template>