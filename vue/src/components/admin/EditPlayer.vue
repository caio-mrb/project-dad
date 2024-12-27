<script setup>
import userPicture from '@/assets/avatar/avatar-none.png';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import InputDialog from '@/components/common/InputDialog.vue';

const props = defineProps({
  nickname: String,
});

const router = useRouter();
const inputDialog = ref(null);
const playerData = ref(null);
const singleGames = ref([]);
const multiplayerGames = ref([]);
const matchHistoryRef = ref(null);

const avatarUrl = computed(() => {
    if (playerData.value?.photo) {
        let baseURL = axios.defaults.baseURL.split("/")

        baseURL.pop()

        return baseURL.join("/") +  "/storage/photos/" + playerData.value.photo;
    }
    return userPicture;
});


const isBlocked = computed(() => playerData.value?.blocked);
const userType = computed(() => playerData.value?.type);

const fetchPlayerData = async () => {
  try {
    let storedToken = localStorage.getItem('token');
    axios.defaults.headers.common.Authorization = "Bearer " + storedToken;

    const response = await axios.get(`/users/admin/${props.nickname}`);

    playerData.value = response.data.data;

    fetchSingleGames();
    fetchMultiplayerGames();
    
  } catch (error) {
    console.error("Error fetching player data:", error);
  }
};

const fetchSingleGames = async () => {
  try {
    let storedToken = localStorage.getItem('token');
    axios.defaults.headers.common.Authorization = "Bearer " + storedToken;

    const response = await axios.get(`/games/admin/${playerData.value.id}`);
    singleGames.value = response.data.data;
  } catch (error) {
    console.error("Error fetching single games:", error);
  }
};

const fetchMultiplayerGames = async () => {
  try {
    let storedToken = localStorage.getItem('token');
    axios.defaults.headers.common.Authorization = "Bearer " + storedToken;

    const response = await axios.get(`/multiplayergames/admin/${playerData.value.id}`);
    multiplayerGames.value = response.data.data;
  } catch (error) {
    console.error("Error fetching multiplayer games:", error);
  }
};

const toggleBlockStatus = async () => {
  try {
    let storedToken = localStorage.getItem('token');
    axios.defaults.headers.common.Authorization = "Bearer " + storedToken;

    await axios.patch(`/users/${playerData.value.id}`);
    fetchPlayerData();
  } catch (error) {
    console.error("Error changing player status:", error);
  }
};

const deleteAccount = async () => {
  inputDialog.value.open(async () => {
    try {
      let storedToken = localStorage.getItem('token');
      axios.defaults.headers.common.Authorization = "Bearer " + storedToken;

      await axios.delete(`/users/${playerData.value.id}`);
      router.push({ name: 'Home' });
    } catch (error) {
      console.error("Error deleting player account:", error);
    }
  });
};

const goBack = () => {
  router.push({ name: 'ListOfPlayers' });
};

const scrollToMatchHistory = () => {
  matchHistoryRef.value.scrollIntoView({ behavior: 'smooth' }); // Desce até a seção "Match History"
};

onMounted(() => {
  fetchPlayerData();
});
</script>

<template>
    <InputDialog
      ref="inputDialog"
      title="Delete Account?"
      message="Type DELETE to confirm account deletion."
    />
    <div class="flex justify-center items-center min-h-screen">
        <div class="bg-white shadow-lg rounded-lg max-w-[500px] w-full p-6">
            <div class="flex justify-center">
          <img
            :src="avatarUrl"
            alt="Avatar"
            class="w-24 h-24 rounded-full border-2 border-purple-500"
          />
        </div>
        <h1 class="text-center text-2xl font-semibold mt-4 text-purple-600">
          {{ playerData?.name || "Loading..." }}
        </h1>
        <p class="text-center text-gray-600">
          <strong>Nickname:</strong> {{ playerData?.nickname }}
        </p>
        <p class="text-center text-gray-500">
          <strong>Email:</strong> {{ playerData?.email }}
        </p>
        <p class="text-center text-gray-500">
          <strong>Blocked:</strong> {{ playerData?.blocked ? "Yes" : "No" }}
        </p>
        <p class="text-center text-gray-500">
          <strong>Type:</strong> {{ userType === "A" ? "Admin" : "Player" }}
        </p>
  
        <div class="mt-6 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            @click="goBack"
            class="bg-gray-500 text-white px-6 py-2 rounded shadow hover:bg-gray-600 w-full sm:w-auto"
          >
            Back
          </button>
  
          <button
            @click="deleteAccount"
            class="bg-red-600 text-white px-6 py-2 rounded shadow hover:bg-red-700 w-full sm:w-auto"
          >
            Delete Account
          </button>
  
          <button
            v-if="userType !== 'A'"
            @click="toggleBlockStatus"
            :class="[ 
              'px-6 py-2 rounded shadow text-white',
              isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700',
              'w-full sm:w-auto'
            ]"
          >
            {{ isBlocked ? "Unblock User" : "Block User" }}
          </button>
  
          <button 
              v-if="userType === 'P'" 
              @click="scrollToMatchHistory" 
              class="bg-purple-600 text-white px-6 py-2 rounded shadow w-full sm:w-auto"
          >
              Match History
          </button>
        </div>
      </div>
    </div>
  
    <!-- Match History Section -->
    <div v-if="userType === 'P'" ref="matchHistoryRef" class="mt-6">
      <h2 class="text-3xl font-bold text-center text-purple-600 mb-4">Match History</h2>
      
      <!-- Single Games (only if user type is 'P') -->
      <div class="mt-4">
        <h2 class="text-2xl font-semibold text-white text-center bg-purple-500 py-2">Single Games</h2>
        <div class="overflow-x-auto mt-4">
          <div class="max-h-96 overflow-y-auto">
            <table class="min-w-full border-collapse table-auto bg-white shadow-lg">
              <thead class="bg-purple-500 text-white">
                <tr>
                  <th class="px-4 py-2">Game ID</th>
                  <th class="px-4 py-2">Board</th>
                  <th class="px-4 py-2">Started At</th>
                  <th class="px-4 py-2">Ended At</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="game in singleGames.slice(0, 10)" :key="game.id">
                  <td class="px-4 py-2">{{ game.id }}</td>
                  <td class="px-4 py-2">{{ game.board.name }}</td>
                  <td class="px-4 py-2">{{ game.began_at }}</td>
                  <td class="px-4 py-2">{{ game.ended_at }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  
      <!-- Multiplayer Games (only if user type is 'P') -->
      <div class="mt-10">
        <h2 class="text-2xl font-semibold text-white text-center bg-purple-500 py-2">Multiplayer Games</h2>
        <div class="overflow-x-auto mt-4">
          <div class="max-h-96 overflow-y-auto">
            <table class="min-w-full border-collapse table-auto bg-white shadow-lg">
              <thead class="bg-purple-500 text-white">
                <tr>
                  <th class="px-4 py-2">Game ID</th>
                  <th class="px-4 py-2">Board</th>
                  <th class="px-4 py-2">Created By</th>
                  <th class="px-4 py-2">Winner</th>
                  <th class="px-4 py-2">Started At</th>
                  <th class="px-4 py-2">Ended At</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="game in multiplayerGames.slice(0, 10)" :key="game.game.id">
                  <td class="px-4 py-2">{{ game.game.id }}</td>
                  <td class="px-4 py-2">{{ game.game.board.name }}</td>
                  <td class="px-4 py-2">{{ game.game.created_user.nickname }}</td>
                  <td class="px-4 py-2">{{ game.game.winner_user?.nickname }}</td>
                  <td class="px-4 py-2">{{ game.game.began_at }}</td>
                  <td class="px-4 py-2">{{ game.game.ended_at }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </template>
  