<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useAuthStore } from '@/stores/auth';

const storeAuth = useAuthStore()

const players = ref([]);
const admins = ref([]);
const totalPages = ref(1);
const currentPage = ref(1);
const maxVisiblePages = 10;

const adminSearch = ref("");
const playerSearch = ref("");

const fetchPlayers = async (page = 1, search = "") => {
  try {
    let storedToken = localStorage.getItem("token");
    axios.defaults.headers.common.Authorization = "Bearer " + storedToken;

    let response = null;

    if (search === "")
      response = await axios.get(`users?page=${page}`);
    else
      response = await axios.get(`users/admin/${search}`);

    const data = response.data.data;

    if (data.type === "A") return;

    players.value = Array.isArray(data) ? data : [data];

    totalPages.value = response.data.meta.last_page;
    currentPage.value = response.data.meta.current_page;
  } catch (error) {
    console.error("Error fetching players:", error);
  }
};

const fetchAdmins = async (search = "") => {
  try {
    let storedToken = localStorage.getItem("token");
    axios.defaults.headers.common.Authorization = "Bearer " + storedToken;

    let response = null;

    if (search === "")
      response = await axios.get(`/users/admins`);
    else
      response = await axios.get(`/users/admin/${search}`);

    const data = response.data.data;

    if (data.type === "P") return;

    const filteredAdmins = Array.isArray(data) ? data : [data];
    admins.value = filteredAdmins.filter(admin => admin.nickname !== storeAuth.userNickname);
    
  } catch (error) {
    console.error("Error fetching admins:", error);
  }
};

const visiblePages = computed(() => {
  const start = Math.max(currentPage.value - Math.floor(maxVisiblePages / 2), 1);
  const end = Math.min(start + maxVisiblePages - 1, totalPages.value);

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const changePage = (page) => {
  if (page !== currentPage.value) {
    fetchPlayers(page, playerSearch.value);
  }
};

const searchAdmins = () => {
  fetchAdmins(adminSearch.value);
};

const searchPlayers = () => {
  fetchPlayers(1, playerSearch.value);
};

onMounted(() => {
  fetchPlayers();
  fetchAdmins();
});
</script>

<template>
  <div class="min-h-screen p-6 space-y-8">
    <div class="bg-white shadow-lg rounded-lg p-4">
      <h2 class="text-lg font-semibold text-purple-600 mb-4">Admins</h2>

      <div class="flex items-center mb-4 space-x-2">
        <input
          v-model="adminSearch"
          type="text"
          placeholder="Search by nickname"
          class="px-3 py-2 border rounded"
        />
        <button
          @click="searchAdmins"
          class="px-4 py-2 text-white bg-purple-500 rounded hover:bg-purple-600"
        >
          Search
        </button>
      </div>

      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-purple-600 text-white">
            <th class="border border-gray-300 px-4 py-2">Nickname</th>
            <th class="border border-gray-300 px-4 py-2">Name</th>
            <th class="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="admin in admins"
            :key="admin.id"
            class="hover:bg-gray-100 transition-colors"
          >
            <td class="border border-gray-300 px-4 py-2">{{ admin.nickname }}</td>
            <td class="border border-gray-300 px-4 py-2">{{ admin.name }}</td>
            <td class="border border-gray-300 px-4 py-2 text-center">
                <router-link
                :to="{ name: 'EditPlayer', params: { nickname: admin.nickname } }"
                class="px-3 py-1 text-white bg-purple-500 rounded hover:bg-purple-600"
                >
                Perfil
                </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="bg-white shadow-lg rounded-lg p-4">
      <h2 class="text-lg font-semibold text-purple-600 mb-4">Players</h2>

      <div class="flex items-center mb-4 space-x-2">
        <input
          v-model="playerSearch"
          type="text"
          placeholder="Search by nickname"
          class="px-3 py-2 border rounded"
        />
        <button
          @click="searchPlayers"
          class="px-4 py-2 text-white bg-purple-500 rounded hover:bg-purple-600"
        >
          Search
        </button>
      </div>

      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-purple-600 text-white">
            <th class="border border-gray-300 px-4 py-2">Nickname</th>
            <th class="border border-gray-300 px-4 py-2">Name</th>
            <th class="border border-gray-300 px-4 py-2">Blocked</th>
            <th class="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="player in players"
            :key="player.id"
            class="hover:bg-gray-100 transition-colors"
          >
            <td class="border border-gray-300 px-4 py-2">{{ player.nickname }}</td>
            <td class="border border-gray-300 px-4 py-2">{{ player.name }}</td>
            <td class="border border-gray-300 px-4 py-2">
              {{ player.blocked ? "Yes" : "No" }}
            </td>
            <td class="border border-gray-300 px-4 py-2 text-center">
                <router-link
                :to="{ name: 'EditPlayer', params: { nickname: player.nickname } }"
                class="px-3 py-1 text-white bg-purple-500 rounded hover:bg-purple-600"
                >
                Perfil
                </router-link>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mt-4 flex justify-center items-center space-x-2">
        <button
          @click="changePage(currentPage - 1)"
          class="px-4 py-2 rounded shadow border bg-white hover:bg-gray-200"
          :disabled="currentPage === 1"
        >
          &laquo;
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          @click="changePage(page)"
          class="px-4 py-2 rounded shadow border bg-white hover:bg-gray-200"
          :class="{ 'bg-purple-500 text-white': page === currentPage }"
        >
          {{ page }}
        </button>

        <button
          @click="changePage(currentPage + 1)"
          class="px-4 py-2 rounded shadow border bg-white hover:bg-gray-200"
          :disabled="currentPage === totalPages"
        >
          &raquo;
        </button>
      </div>
    </div>
  </div>
</template>
