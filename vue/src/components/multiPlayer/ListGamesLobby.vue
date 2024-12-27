<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useLobbyStore } from '@/stores/lobby';
import ThemedAlertDialog from '@/components/ui/themed-alert-dialog/ThemedAlertDialog.vue';


const selectedRoom = ref(null);
const storeAuth = useAuthStore();
const storeLobby = useLobbyStore();

const selectRoom = (game) => {
  if(!storeLobby.canJoinGame(game) || selectedRoom.value === game){
    selectedRoom.value = null;
    return;
  }

  selectedRoom.value =  game;

};

const joinGame = () =>{
  if(selectedRoom){
    storeLobby.joinGame(selectedRoom.value.id);
    selectedRoom.value = null;
  }
}


onMounted(() => {
  storeLobby.fetchGames();
});
</script>


<template>
    <div class="flex flex-col items-center justify-center h-[70vh] font-sans">
      <div class="max-h-72 overflow-y-auto rounded-xl w-full max-w-lg">
        <table class="table-auto w-full bg-purple-50">
          <thead class="bg-purple-700 text-white">
            <tr>
              <th class="px-4 py-2 text-left">Room's Name</th>
              <th class="px-4 py-2 text-center">Game Status</th>
              <th class="px-4 py-2 text-right">Players</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-if="storeLobby.totalGames > 0"
              v-for="game in storeLobby.games"
              :key="game.id"
              @click="selectRoom(game)"
              :class="{ 'bg-purple-300': selectedRoom === game, 'hover:bg-purple-200': true }"
            >
              <td class="border-b px-4 py-2 text-left">{{storeAuth.getFirstLastName(game.players[0].user.name)}}'s Game</td>
              <td class="border-b px-4 py-2 text-center">{{ storeLobby.getGameStatus(game) }}</td>
              <td class="border-b px-4 py-2 text-right">{{ game.players.length}}/{{ game.playerCapacity}}</td>
            </tr>
            <tr v-else>
              <td colspan="3" class="text-center py-2">The lobby is empty!</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex justify-between items-center w-full max-w-lg mt-4">
        <ThemedAlertDialog v-if="storeAuth.user && storeAuth.userType == 'P'"
          :title="storeAuth.userBalance <= 4 ? 'You don\'t have enough Braincoins' : 'Spend five Braincoin?'"
          :description="storeAuth.userBalance <= 4
            ? 'You need at least five Braincoins to play this game.'
            : 'This will permanently use five coins on game start and will not return even if you leave the game.'"
          :confirmText="'Ok'"
          :cancelText="storeAuth.userBalance <= 4 ? '' : 'Cancel'"
          :onConfirm="storeAuth.userBalance <= 4 ? null : storeLobby.addGame">
          <template #trigger>
            Create New Game
          </template>
        </ThemedAlertDialog>
        <ThemedAlertDialog v-if="storeAuth.user && storeAuth.userType == 'P'"
          :title="storeAuth.userBalance <= 4 ? 'You don\'t have enough Braincoins' : 'Spend five Braincoin?'"
          :description="storeAuth.userBalance <= 4
            ? 'You need at least five Braincoins to play this game.'
            : 'This will permanently use five coins on game start and will not return even if you or owner leave the lobby.'"
          :confirmText="'Ok'"
          :cancelText="storeAuth.userBalance <= 4 ? '' : 'Cancel'"
          :onConfirm="storeAuth.userBalance <= 4 ? null : joinGame"
          :disabled="!selectedRoom">
          <template #trigger>
            Join
          </template>
        </ThemedAlertDialog>
      </div>
    </div>
  </template>
  