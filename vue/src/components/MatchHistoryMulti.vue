<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const AuthStore = useAuthStore();
const router = useRouter();
const games = ref([]); 
const visibleCount = ref(9); 
let searchQuery = ref('');
let startDate = ref(''); 
let endDate = ref('');
const search = ref('');
const sDate = ref(''); 
const eDate = ref('');

// Função para carregar os dados dos jogos
const loadGames = async () => {
  try {
    const response = await AuthStore.getgamesM(); 
    games.value = response;
  } catch (error) {
    console.error('Erro ao carregar os dados dos jogos:', error);
  }
};

// Incrementa o número de itens visíveis
const showMore = () => {
  visibleCount.value += 9; 
};
//funcao para filtrar
const filteredGames = computed(() => {
  let filtered = games.value;

  
  if (searchQuery.value) {
    const searchLower = searchQuery.value.toLowerCase();
    filtered = filtered.filter((game) => {
      return (
        game.game.id.toString().toLowerCase()===searchLower ||
        game.players[0].user.nickname.toString().toLowerCase()===searchLower ||
        game.players[1].user.nickname.toString().toLowerCase()===searchLower 
      );
    });
  }
  if (startDate.value && endDate.value) {
    filtered = filtered.filter((game) => {
      const gameDate = new Date(game.game.began_at);
      return gameDate >= new Date(startDate.value) && gameDate <= new Date(endDate.value);
    });
  }

  return filtered;
});

const Pesquisa = () => {
  searchQuery=search;
  loadGames();
};
const PesquisaD = () => {
  startDate=sDate;
  endDate=eDate;
  loadGames();
};
const Apagar = () => {
  startDate="";
  endDate="";
  searchQuery="";
  loadGames();
};

onMounted(() => {
  loadGames();
});

</script>

<template>
  <div class="flex-container" >
      <button
        type="button"
        @click="router.push({ name: 'MatchHistorySingle' })"
        class="bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600"
      >
            Match History Singleplayer
      </button>
      <div >
      <input 
        type="date" 
        v-model="sDate" 
        class="border border-gray-300 rounded px-3 py-2 text-sm"
        placeholder="Data de Início (Start)"
      />
      <input 
        type="date" 
        v-model="eDate" 
        class="border border-gray-300 rounded px-3 py-2 text-sm"
        placeholder="Data de Fim (End)"
      />
      <button 
        @click="PesquisaD"
        class="bg-blue-500 text-white px-4 py-2 rounded">
        Search
      </button>
    </div>
    <div>
      <input 
        type="text" 
        v-model="search" 
        placeholder="Pesquisar..." 
        class="border border-gray-300 rounded px-3 py-2 text-sm w-64 shadow-lg"
      />
      <button 
        @click="Pesquisa"
        class="bg-blue-500 text-white px-4 py-2 rounded">
        Search
      </button>
    </div>
    <button 
        @click="Apagar"
        class="bg-red-500 text-white px-4 py-2 rounded">
         Delete Search
      </button>
    </div>
  <div class="flex justify-center items-center mt-10 margin top">
    <div class="bg-white shadow-lg rounded-lg  ">
      <div v-if="filteredGames.length > 0">
        <div class="mb-6">
    <h2 class=" flex text-lg font-semibold text-purple-500 justify-center">Match History</h2>
    </div>
        <table class="table-auto w-full text-left border-collapse">
    <thead>
      <tr class="bg-purple-600 text-white">
        <th class="px-4 py-2">ID</th>
        <th class="px-4 py-2">Date</th>
        <th class="px-4 py-2">Status</th>
        <th class="px-4 py-2">Board Size</th>
        <th class="px-4 py-2">Total Time</th>
        <th class="px-4 py-2">Total Turns</th>
        <th class="px-4 py-2" >Game creator</th>
        <th class="px-4 py-2" >Rival</th>
        <th class="px-4 py-2" >Winner</th>
      </tr>
    </thead>
    <tbody>
      <tr
      v-for="game in filteredGames.slice(0, visibleCount)" :key="game.game.id"
        class="hover:bg-gray-100"
      >
        <td class="border px-4 py-2">{{ game.game.id }}</td>
        <td class="border px-4 py-2">{{ game.game.began_at }}</td>
        <td class="border px-4 py-2">{{ game.game.status }}</td>
        <td class="border px-4 py-2">{{ game.game.board.name }}</td>
        <td class="border px-4 py-2">{{ game.game.total_time }}</td>
        <td class="border px-4 py-2">{{ game.game.total_turns_winner }}</td>
        <td class="border px-4 py-2">
          <div class="flex items-center">
            <span>{{ game.game.created_user.nickname }}</span>
          </div>
        </td>
        <td class="border px-4 py-2">
          <div class="flex items-center">
            <span>{{ game.players[1].user.nickname }}</span>
          </div>
        </td>
        <td class="border px-4 py-2">
          <div class="flex items-center">
            <span>{{game.game.winner_user.nickname}}</span>
          </div>
        </td>
        
      </tr>
    </tbody>
  </table>
        <button 
        v-if="visibleCount < games.length" 
        @click="showMore" 
        class="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Mostrar mais
      </button>
    </div>
      <p v-else-if="games.length > 0">Nenhum jogo encontrado para "{{ searchQuery }}"</p>
      <p v-else>Carregando jogos...</p>
      
    </div>
  </div>
  </template>
  <style >
  .flex-container {
    display: flex;
    justify-content: space-between;
  }
  </style>
  

  