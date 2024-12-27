<script setup>
import { computed, onMounted, ref, watch  } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useLobbyStore } from '@/stores/lobby';
import axios from 'axios';

const storeAuth = useAuthStore();
const storeLobby = useLobbyStore();

// Game state management
const currentGame = computed(() => storeLobby.getCurrentGame());
const boardSizes = ref([{}]);
const selectedBoard = ref([{}]); // Default board ID
const error = ref(null);


// Fetch current game on component mount
onMounted(async () => {
  // Fetch board sizes only once
  await fetchBoardSizes();
});

watch(
  () => currentGame.value?.board,
  (newBoard) => {
    if (!isOwner.value && newBoard) {
      selectedBoard.value = newBoard;
    }
  }
);

// Computed properties for game state
const players = computed(() => currentGame.value?.players || []);
const playerCapacity = computed(() => currentGame.value?.playerCapacity || 4);
const emptySlots = computed(() => playerCapacity.value - players.value.length);

// Check if current user is owner
const isOwner = computed(() => {

  if (!currentGame.value || !storeLobby.socket) return false;
  return currentGame.value.players[0].socketId === storeLobby.socket.id;
});

// Fetch board sizes from API
const fetchBoardSizes = async () => {
  try {
    const response = await axios.get('/boards');
    boardSizes.value = response.data.data;
    // Set initial selected board size if not set
    if (!selectedBoard.value && boardSizes.value.length > 0) {
      selectedBoard.value = boardSizes.value[1];
    }
  } catch (err) {
    console.error('Error fetching board sizes:', err);
    error.value = 'Failed to load board configurations';
  }
};

// Update board size
const updateBoardSize = (newBoard) => {
  if (!isOwner.value) return;
  storeLobby.updateBoardSize(currentGame.value.id, newBoard);
};

// Game actions
const quitRoom = () => {
  if (!currentGame.value) return;
  storeLobby.leaveLobby(currentGame.value.id);
};

const startGame = () => {
  if (!isOwner.value || !currentGame.value) return;
  storeLobby.startGame(currentGame.value);
};


</script>

<template>
  <div class="flex flex-col items-center justify-center h-[70vh] font-sans">
    <!-- Error Display -->
    <div v-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
      {{ error }}
    </div>

    <!-- Board Size Selection -->
    <div class="board-size-container mb-6">
      <!-- Owner View -->
      <div v-if="isOwner" class="bg-white rounded-lg shadow-md">
        <div class="bg-purple-700 px-4 py-2 rounded-t-lg">
          <h2 class="text-lg font-semibold text-white">Choose Board Size</h2>
        </div>
        <div class="p-4">
          <div v-for="size in boardSizes.slice(1)" :key="size.id" class="mb-2">
            <label class="flex items-center cursor-pointer hover:bg-purple-50 p-2 rounded">
              <input type="radio" :value="size" v-model="selectedBoard" @change="updateBoardSize(size)"
                class="mr-3 accent-purple-700" />
              <span class="text-gray-700">{{ size.name }}</span>
            </label>
          </div>
        </div>
      </div>
      <!-- Non-owner View -->
      <div v-else class="bg-purple-700 text-white p-4 rounded-lg">
        <p class="text-lg">
          Current Board:
          <span v-if="selectedBoard?.name == null" class="italic">Owner's choosing...</span>
          <span v-else>{{selectedBoard?.name}}</span>        
        </p>
      </div>
    </div>

    <!-- Players List -->
    <div class="w-full max-w-lg bg-white rounded-lg shadow-md">
      <div class="bg-purple-700 px-4 py-3">
        <h2 class="text-lg font-semibold text-white">Players</h2>
      </div>
      <div class="divide-y divide-gray-200">
        <!-- Active Players -->
        <div v-for="player in players" :key="player.socketId" class="px-4 py-3 flex items-center">
          <span class="flex-grow">{{ storeAuth.getFirstLastName(player.user.name) }}</span>
          <span v-if="player.socketId === currentGame?.players[0].socketId" class="text-yellow-400">
            <svg class="h-6 w-6" height="800px" width="800px" version="1.1" id="Layer_1"
              xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"
              xml:space="preserve">
              <polygon style="fill:#FFEA8A;" points="0,443.733 0,68.267 17.067,68.267 136.533,187.733 256,68.267 375.467,187.733 494.933,68.267 512,68.267 512,443.733 " />
              <polygon style="fill:#FFDB2D;" points="494.933,68.267 375.467,187.733 256.002,68.267 256,68.267 256,443.733 512,443.733 512,68.267 " />
            </svg>
          </span>
        </div>
        <!-- Empty Slots -->
        <div v-for="n in emptySlots" :key="`empty-${n}`" class="px-4 py-3 text-gray-400 italic">
          Waiting for player...
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between items-center w-full max-w-lg mt-6">
      <button @click="quitRoom"
        class="bg-purple-700 text-white px-6 py-2 rounded-full hover:bg-purple-800 transition-colors">
        Leave Room
      </button>
      <button
        class="bg-purple-500 text-white px-6 py-2 rounded-full disabled:bg-purple-200 disabled:cursor-not-allowed"
        :disabled="!storeLobby.canStartGame(currentGame)"
        @click="startGame">
        Start Game
      </button>
    </div>
  </div>
</template>