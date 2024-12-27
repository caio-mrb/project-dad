<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Store and Router
const storeAuth = useAuthStore();
const router = useRouter();

// Data refs
const stats = ref(null);
const purchases = ref([]); // Stores purchases
const isLoading = ref(true);
const error = ref(null);
const chartCanvas = ref(null);
const currentPage = ref(1); // Current page
const totalPages = ref(0); // Total pages from API meta
const selectedYear = ref(null); // Selected year for the chart
const availableYears = ref([]); // Available years for the dropdown
const searchNickname = ref(''); // Input for nickname search

let chartInstance = null;

// Fetch statistics data from the API
const fetchStatistics = async () => {
  let storedToken = localStorage.getItem('token');
  if (storedToken) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + storedToken;
  }

  try {
    isLoading.value = true;

    const response = await axios.get('/statistics');
    stats.value = response.data.data;

    // Get available years
    const years = stats.value.games_by_week.map(week =>
      new Date(week.start_day).getFullYear()
    );
    availableYears.value = [...new Set(years)]; // Get unique years
    selectedYear.value = availableYears.value[availableYears.value.length - 1];
  } catch (err) {
    console.error('Error fetching statistics:', err);
    error.value = 'Error loading statistics. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

// Fetch purchases data
const fetchPurchases = async (page = 1) => {
  let storedToken = localStorage.getItem('token');
  if (storedToken) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + storedToken;

    try {

      const response = await axios.get(`/transactions/all/purchases?page=${page}`);
      purchases.value = response.data.data; // Current page data
      totalPages.value = response.data.meta.last_page; // Total pages
      currentPage.value = response.data.meta.current_page; // Current page
    } catch (err) {
      console.error('Error fetching purchases:', err);
      error.value = 'Error loading purchases. Please try again later.';
    } finally {
    }
  }
};


const fetchPurchasesByNickname = async () => {
  let storedToken = localStorage.getItem('token');
  if (storedToken) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + storedToken;

    try {
      const response = await axios.get(`/transactions/all/purchases/${searchNickname.value}`);

      if (response.status === 200 || response.status === 201) {
        purchases.value = response.data.data;
        totalPages.value = response.data.meta.last_page; // Atualiza o total de páginas
        currentPage.value = response.data.meta.current_page; // Atualiza a página atual
      }
    } catch (err) {
      console.error('Error fetching purchases by nickname:', err);
      purchases.value = [];
      totalPages.value = 1; // Reseta o total de páginas caso não haja resultados
      currentPage.value = 1; // Reseta a página atual
    }
  }
};



// Handle page change
const handlePageChange = async (event) => {
  const selectedPage = event.target.value;
  await fetchPurchases(selectedPage);
};

// Handle year change
const handleYearChange = async (event) => {
  selectedYear.value = event.target.value;
  createChart();
};

// Create a chart for games by week
const createChart = () => {
  if (!stats.value || !chartCanvas.value) {
    console.error('Canvas element not found or stats are empty');
    return;
  }

  // Destroy the previous chart instance if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Filter data for the selected year
  const filteredData = stats.value.games_by_week.filter(week =>
    new Date(week.start_day).getFullYear() === parseInt(selectedYear.value)
  );

  const data = filteredData.map(week => ({
    label: `Week ${week.week_year}`,
    value: week.count,
  }));

  const labels = data.map(item => item.label);
  const values = data.map(item => item.value);

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: `Games in Year ${selectedYear.value}`,
          data: values,
          backgroundColor: 'rgba(93, 95, 239, 0.6)',
          borderColor: 'rgba(93, 95, 239, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
};

// Lifecycle hook
onMounted(async () => {
  await fetchStatistics();

  if(storeAuth.userType == "A")
  {
    await fetchPurchases();
  }
  
  await nextTick();
  createChart();
});
</script>

<template>
    <div class="flex justify-center items-center min-h-screen">
      <div class="bg-white shadow-lg rounded-lg max-w-4xl w-full p-6">
        <h1 class="text-2xl font-semibold text-purple-600 text-center mb-6">
          Statistics
        </h1>
  
        <div v-if="isLoading" class="text-center text-gray-500">
          Loading statistics...
        </div>
  
        <div v-else-if="error" class="text-center text-red-600">
          {{ error }}
        </div>
  
        <div v-else>
          <!-- General Stats -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-purple-500">General Information</h2>
            <p class="text-gray-800"><strong>Total Registered Users:</strong> {{ stats.users }}</p>
            <p class="text-gray-800"><strong>Total Games Played:</strong> {{ stats.games }}</p>
            <p class="text-gray-800">
              <strong>Games Last Week:</strong>
              {{ stats.games_last_week.count }} (Week {{ stats.games_last_week.week_year }}, starting from {{ stats.games_last_week.start_day }})
            </p>
          </div>
  
          <!-- Chart -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-purple-500">Games by Week</h2>
            <div class="mb-6">
              <label for="year-selector" class="font-medium text-gray-700">Select Year:</label>
              <select
                id="year-selector"
                @change="handleYearChange"
                class="ml-2 px-4 py-2 border rounded"
              >
                <option
                  v-for="year in availableYears"
                  :key="year"
                  :value="year"
                  :selected="year === selectedYear"
                >
                  {{ year }}
                </option>
              </select>
            </div>
            <canvas ref="chartCanvas" id="chartCanvas"></canvas>
          </div>
  
          <!-- Purchases Table -->
          <div v-if="storeAuth.userType == 'A'">
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-purple-500">Purchases</h2>
  
              <!-- Search by Nickname -->
              <div class="flex items-center mb-4">
                <input
                  v-model="searchNickname"
                  type="text"
                  placeholder="Enter nickname"
                  class="px-4 py-2 border rounded w-full"
                />
                <button
                  @click="fetchPurchasesByNickname"
                  class="ml-2 px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700"
                >
                  Search
                </button>
              </div>
  
              <!-- Table -->
              <table class="table-auto w-full text-left border-collapse">
                <thead>
                  <tr class="bg-purple-600 text-white">
                    <th class="px-4 py-2">ID</th>
                    <th class="px-4 py-2">Date</th>
                    <th class="px-4 py-2">Player</th>
                    <th class="px-4 py-2">Coins</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="purchase in purchases"
                    :key="purchase.id"
                    class="hover:bg-gray-100"
                  >
                    <td class="border px-4 py-2">{{ purchase.id }}</td>
                    <td class="border px-4 py-2">{{ purchase.datetime }}</td>
                    <td class="border px-4 py-2">
                      <div class="flex items-center">
                        <span>{{ purchase.user.nickname }}</span>
                      </div>
                    </td>
                    <td class="border px-4 py-2">{{ purchase.coins }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
  
            <!-- Dropdown for page selection -->
            <div class="mt-4">
              <label for="page-selector" class="font-medium text-gray-700">Select Page:</label>
              <select
                id="page-selector"
                @change="handlePageChange"
                class="ml-2 px-4 py-2 border rounded"
              >
                <option
                  v-for="page in totalPages"
                  :key="page"
                  :value="page"
                  :selected="page === currentPage"
                >
                  Page {{ page }}
                </option>
              </select>
            </div>
          </div>
  
          <!-- Actions -->
          <div class="flex justify-end mt-4">
            <button
              @click="router.push({ name: 'Home' })"
              class="bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  