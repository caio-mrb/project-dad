<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const AuthStore = useAuthStore();
const games = ref([]);
const Boards = ref([]);
const loadGames = async () => {
  try {
    const response = await AuthStore.getGlobalScore(); 
    games.value = response;
    const response2 = await AuthStore.getBoards(); 
    Boards.value = response2;
  } catch (error) {
    console.error('Erro ao carregar os dados dos jogos:', error);
  }
};

const filtered = computed(() => {
  const PS = {};

  Boards.value.forEach((board) => {
    const gameTurn = games.value.turns?.[board.id]?.[0];  
    const gameTime = games.value.time?.[board.id]?.[0];  

    if (gameTurn && gameTime) {
      PS[board.id] = {
        total_turns_winner: gameTurn.total_turns_winner,
        total_turns_winner_nickname: gameTurn.created_user?.nickname || 'Desconhecido',
        total_time: parseFloat(gameTime.total_time) || 0,
        total_time_nickname: gameTime.created_user?.nickname || 'Desconhecido'
      };
    }
  });

  return PS;
});

const multiplayerTop = computed(() => {
  return games.value.multiplayer;
});

onMounted(() => {
  loadGames();
});
</script>

<template>
  <div>

    <div class="flex-container">
      <!-- Top Singleplayer -->
      <div class="bg-white shadow-lg rounded-lg max-w-md w-full p-6">
        <div class="mb-6">
      <h2 class=" flex text-lg font-semibold text-purple-500 justify-center"> Top Singleplayer By Time</h2>
    </div>
          <table class="table-auto w-full text-left border-collapse">
  <thead>
    <tr class="bg-purple-600 text-white">
      <th class="px-4 py-2">Board Size</th>
      <th class="px-4 py-2">Best Time</th>
      <th class="px-4 py-2">Player</th>
    </tr>
  </thead>

  
  <tbody>
    <tr
    v-for="board in Boards" :key="board.id"
      class="hover:bg-gray-100"
    >
      <td class="border px-4 py-2">{{ board.name }}</td>
      <td class="border px-4 py-2">{{filtered[board.id]?.total_time }}</td>
      <td class="border px-4 py-2">{{filtered[board.id]?.total_time_nickname}}</td>       
    </tr>
  </tbody>
</table>
<div class="mb-6">
      <h2 class=" flex text-lg font-semibold text-purple-500 justify-center"> Top Singleplayer By Turns</h2>
    </div>
<table class="table-auto w-full text-left border-collapse">
  <thead>
    <tr class="bg-purple-600 text-white">
      <th class="px-4 py-2">Board Size</th>
      <th class="px-4 py-2">Minimum Turns</th>
      <th class="px-4 py-2">Player</th>
    </tr>
  </thead>
  <tbody>
    <tr
    v-for="board in Boards" :key="board.id"
      class="hover:bg-gray-100"
    >
      <td class="border px-4 py-2">{{ board.name }}</td>
      <td class="border px-4 py-2">{{filtered[board.id]?.total_turns_winner }}</td>
      <td class="border px-4 py-2">{{filtered[board.id]?.total_turns_winner_nickname}}</td>       
    </tr>
  </tbody>
</table>

      </div>

      <!-- Top 5 Multiplayer -->
      <div class="bg-white shadow-lg rounded-lg max-w-md w-full p-6">
        <div class="mb-6">
      <h2 class=" flex text-lg font-semibold text-purple-500 justify-center"> Top 5 Multiplayer </h2>
    </div>
        <table class="table-auto w-full text-left border-collapse">
<thead>
  <tr class="bg-purple-600 text-white">
    <th class="px-4 py-2">Position</th>
    <th class="px-4 py-2">Player</th>
    <th class="px-4 py-2">Wins</th>
  </tr>
</thead>
<tbody>
  <tr v-for="(player, index) in multiplayerTop" :key="index" class="hover:bg-gray-100">
      <td class="border px-4 py-2">{{ index + 1 }}</td>
      <td class="border px-4 py-2">{{ player.user.nickname }}</td>
      <td class="border px-4 py-2">{{ player.wins }}</td>     
    </tr>

</tbody>
</table>
      </div>
    </div>
  </div>
</template>

<style>
.flex-container {
  display: flex;
  justify-content: space-between;
}
</style>
