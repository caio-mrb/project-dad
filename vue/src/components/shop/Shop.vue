<script setup>
import {  ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import brainCoinPic1 from '@/assets/braincoins-shop/braincoin1.png';
import brainCoinPic2 from '@/assets/braincoins-shop/braincoin2.png';
import brainCoinPic3 from '@/assets/braincoins-shop/braincoin3.png';
import brainCoinPic4 from '@/assets/braincoins-shop/braincoin4.png';
import brainCoinPic5 from '@/assets/braincoins-shop/braincoin5.png';


// Store and Router
const storeAuth = useAuthStore();
const router = useRouter();

// Array of items (images and prices)
const items = ref([
  { id: 1, image: brainCoinPic1, price: '5€' },
  { id: 2, image: brainCoinPic2, price: '10€' },
  { id: 3, image: brainCoinPic3, price: '20€' },
  { id: 4, image: brainCoinPic4, price: '50€' },
  { id: 5, image: brainCoinPic5, price: '100€' }
  ]);

const goToProductDetails = (id) => {
  router.push({ name: 'shopPayment', params: { id } });
};

</script>

<template>
  <div class="flex flex-wrap justify-center items-center min-h-screen gap-4">
    <!-- Render each item dynamically -->
    <div 
      v-for="item in items" 
      :key="item.id" 
      class="bg-white shadow-lg rounded-lg w-64 min-h-80 p-4 flex flex-col items-center">
      <!-- Image Container with Aspect Ratio -->
      <div class="w-full aspect-w-4 aspect-h-3">
        <img :src="item.image" alt="item image" class="w-full h-full object-cover rounded" />
      </div>
      <!-- Button -->
      <button
        @click="goToProductDetails(item.id)"
        class="mt-4 bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 w-full">
        {{ item.price }}
      </button>
    </div>
  </div>
</template>
