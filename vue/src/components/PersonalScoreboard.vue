<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';


const AuthStore = useAuthStore();
console.log(AuthStore.getgamesS)
const gamesM = ref([]); 
const gamesS = ref([]); 
const Boards = ref([]); 
let User;
let PS = {};  
let Record = [0, 0,0,null]; 
let numero;





const loadGames = async () => {
  try {
    const response = await AuthStore.getgamesM(); 
    gamesM.value = response; 
    const response1 = await AuthStore.getgamesS(); 
    gamesS.value = response1; 
    const response2 = await AuthStore.getBoards(); 
    Boards.value = response2; 
    User = AuthStore.userId;
  } catch (error) {
    console.error('Erro ao carregar os dados dos jogos:', error);
  }
};
const filtered = (boardId) => {
  if (!PS[boardId]) {
    PS[boardId] = {
      total_turns_winner: Infinity,
      total_time: Infinity,
    };
  }

  gamesS.value.forEach((game) => {
    if (game.board.id === boardId) {
      if (
        game.total_turns_winner &&
        game.total_turns_winner < PS[boardId].total_turns_winner
      ) {
        PS[boardId].total_turns_winner = game.total_turns_winner;
      }
      if (
        game.total_time &&
        parseFloat(game.total_time) < parseFloat(PS[boardId].total_time)
      ) {
        PS[boardId].total_time = parseFloat(game.total_time);
      }
    }
  });
  
  return PS[boardId];
};




const Counted = () => {
  Record = [0, 0,0,null];

  gamesM.value.forEach((games) => {
    if (games.game.winner_user && games.game.winner_user.id === User) {
      Record[0]++; 
    } else {
      games.players.forEach((player) => {
        if (player.user.id === User && player.won === false) {
          Record[1]++; 
        }
      });
    }
  });
  numero=(Record[0]/(Record[0]+Record[1]))*100;
  Record[2] = parseFloat(numero.toFixed(1));
  return Record;
};

     
// Carrega os dados assim que o componente é montado
onMounted(() => {
  loadGames();
});

</script>
  <template>
    <div>
  
      <div class="flex-container">
        <div class="bg-white shadow-lg rounded-lg max-w-md w-full p-6 ">
          <div class="mb-6">
        <h2 class=" flex text-lg font-semibold text-purple-500 justify-center">Best Singleplayer Games</h2>
        </div>
          <table class="table-auto w-full text-left border-collapse">
    <thead>
      <tr class="bg-purple-600 text-white">
        <th class="px-4 py-2">Board Size</th>
        <th class="px-4 py-2">Best Time</th>
        <th class="px-4 py-2">Minimum Turns</th>
      </tr>
    </thead>
    <tbody>
      <tr
      v-for="board in Boards" :key="board.id"
        class="hover:bg-gray-100"
      >
        <td class="border px-4 py-2">{{ board.name }}</td>
        <td class="border px-4 py-2">{{filtered(board.id).total_time }}</td>
        <td class="border px-4 py-2">{{filtered(board.id).total_turns_winner}}</td>       
      </tr>
    </tbody>
  </table>
        </div>
      <div class="bg-white shadow-lg rounded-lg max-w-md w-full p-6  ">
        <div class="mb-6">
        <h2 class=" flex text-lg font-semibold text-purple-500 justify-center"> Multiplayer Score</h2>
      </div>
        <table class="table-auto w-full text-left border-collapse">
  <thead>
    <tr class="bg-purple-600 text-white">
      <th class="px-4 py-2">Wins</th>
      <th class="px-4 py-2">Losses Time</th>
      <th class="px-4 py-2">Winrate Turns</th>
    </tr>
  </thead>
  <tbody>
    <tr class="hover:bg-gray-100">
      <td class="border px-4 py-2">{{ Counted()[0]}}</td>
      <td class="border px-4 py-2">{{ Counted()[1]}}</td>
      <td class="border px-4 py-2">{{ Counted()[2]}}</td>     
    </tr>
  </tbody>
</table>
      </div>
    </div>
    </div>
  </template>
  <style >
  .flex-container {
    display: flex;
    justify-content: space-between;
  }
  .flex-container {
  display: flex; /* Define o layout flex */
  justify-content: space-between; 
  align-items: flex-start; /* Garante que o topo das caixas esteja alinhado */
  
}

.flex-container > div {
  flex: 0 1 auto; 
}
  </style>
