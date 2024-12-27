<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';


const AuthStore = useAuthStore();
const trans = ref([]); 
const visibleCount = ref(3); 
let searchQuery = ref('');
let startDate = ref(''); 
let endDate = ref('');
const search = ref('');
const sDate = ref(''); 
const eDate = ref('');
let tipo='';

const loadGames = async () => {
  try {
    const response = await AuthStore.getTransactions(); 
    trans.value = response;
  } catch (error) {
    console.error('Erro ao carregar os dados das transaçoes:', error);
  }
};

const showMore = () => {
  visibleCount.value += 3; 
};
//funcao para filtrar
const filteredTransactions = computed(() => {
  let filtered = trans.value;
  if(tipo){
    filtered = filtered.filter((tran) => {
      return (
        tran.type.toString()===tipo
      );
    });
  }
  
  if (searchQuery.value) {
    const searchLower = searchQuery.value.toLowerCase();
    filtered = filtered.filter((tran) => {
      return (
        tran.id.toString().toLowerCase()===searchLower ||
        tran.user.nickname.toString().toLowerCase()===searchLower 

      );
    });
  }
  if (startDate.value && endDate.value) {
    filtered = filtered.filter((tran) => {
      const gameDate = new Date(tran.datetime);
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
const PesquisaI = () => {
  tipo='I';
  loadGames();
};
const PesquisaE = () => {
  tipo='B';
  loadGames();
};
const PesquisaC = () => {
  tipo='P';
  loadGames();
};
const Apagar = () => {
  startDate="";
  endDate="";
  searchQuery="";
  tipo="";
  loadGames();
};

onMounted(() => {
  loadGames();
});

</script>

<template>
  <div class="flex-container" >
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
    <div class="flex-containerc mt-10 margin top" >
      <button 
        @click="PesquisaI"
        class="bg-blue-500 text-white px-4 py-2 rounded">
        Internal 
      </button>
      <button 
        @click="PesquisaE"
        class="bg-blue-500 text-white px-4 py-2 rounded">
        External 
      </button>
      <button 
        @click="PesquisaC"
        class="bg-blue-500 text-white px-4 py-2 rounded">
        Purchase
      </button>
    </div>
  <div class="flex justify-center items-center  ">
    <div class="bg-white shadow-lg rounded-lg ">
      <div v-if="filteredTransactions.length > 0">
        <div class="mb-6">
  <h2 class=" flex text-lg font-semibold text-purple-500 justify-center">Transaction History</h2>
  </div>

  <!-- Table -->
  <table class="table-auto w-full text-left border-collapse">
    <thead>
      <tr class="bg-purple-600 text-white">
        <th class="px-4 py-2">ID</th>
        <th class="px-4 py-2">Date</th>
        <th class="px-4 py-2">Type</th>
        <th class="px-4 py-2">Braincoins</th>
        <th class="px-4 py-2">Euros</th>
        <th class="px-4 py-2">Payment Method</th>
        <th class="px-4 py-2">reference</th>
        <th class="px-4 py-2" v-if="AuthStore.userType == 'A'">User</th>
      </tr>
    </thead>
    <tbody>
      <tr
      v-for="tran in filteredTransactions.slice(0, visibleCount)" :key="tran.id"
        class="hover:bg-gray-100"
      >
        <td class="border px-4 py-2">{{ tran.id }}</td>
        <td class="border px-4 py-2">{{ tran.datetime }}</td>
        <td class="border px-4 py-2" v-if="tran.type==='B'"> External</td>
        <td class="border px-4 py-2" v-else-if="tran.type==='I'">Internal</td>
        <td class="border px-4 py-2" v-else-if="tran.type==='P'">Purchase</td>
        <td class="border px-4 py-2" >{{ tran.coins}}</td>
        <td class="border px-4 py-2" v-if="tran.type==='P'">{{ tran.euros}}</td>
        <td class="border px-4 py-2" v-else>   </td>
        <td class="border px-4 py-2" v-if="tran.type==='P'">{{ tran.payment.type}}</td>
        <td class="border px-4 py-2" v-else>   </td>
        <td class="border px-4 py-2" v-if="tran.type==='P'">{{ tran.payment.reference}}</td>
        <td class="border px-4 py-2" v-else>   </td>
        <td class="border px-4 py-2" v-if="AuthStore.userType == 'A'">
          <div class="flex items-center">
            <span>{{ tran.user.nickname }}</span>
          </div>
        </td>
        
      </tr>
    </tbody>
  </table>
      <button 
      v-if="visibleCount < filteredTransactions.length" 
      @click="showMore" 
      class="bg-blue-500 text-white px-4 py-2 rounded mt-4"
    >
      Mostrar mais
    </button>
  </div>
      <p v-else-if="trans.length > 0">Nenhum jogo encontrado para "{{ searchQuery }}"</p>
      <p v-else>Carregando jogos...</p>
      
    </div>
  </div>
</template>
<style >
.flex-container {
  display: flex;
  justify-content: space-between;
}
.flex-containerc {
  display: flex;
  justify-content: center;
}

</style>
