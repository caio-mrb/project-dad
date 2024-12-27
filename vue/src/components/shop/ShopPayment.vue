<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

import brainCoinPic1 from '@/assets/braincoins-shop/braincoin1.png';
import brainCoinPic2 from '@/assets/braincoins-shop/braincoin2.png';
import brainCoinPic3 from '@/assets/braincoins-shop/braincoin3.png';
import brainCoinPic4 from '@/assets/braincoins-shop/braincoin4.png';
import brainCoinPic5 from '@/assets/braincoins-shop/braincoin5.png';

import ErrorMessage from '@/components/common/ErrorMessage.vue';
import { useErrorStore } from '@/stores/error'
import { useSuccessStore } from '@/stores/success'

const storeError = useErrorStore()
const storeSuccess = useSuccessStore();


const router = useRouter();
const route = useRoute();
const storeAuth = useAuthStore();

const productId = route.params.id;

// Define the items available in the shop
const items = [
  { id: 1, image: brainCoinPic1, price: 5, brainCoins: 10 },
  { id: 2, image: brainCoinPic2, price: 10, brainCoins: 20 },
  { id: 3, image: brainCoinPic3, price: 20, brainCoins: 42 },
  { id: 4, image: brainCoinPic4, price: 50, brainCoins: 110 },
  { id: 5, image: brainCoinPic5, price: 100, brainCoins: 240 },
];

// Find the selected product
const product = items.find((item) => item.id == productId);

const type = ref('');
const reference = ref('');

// Function to handle the payment process
async function processPayment() {

  if(!type.value || !reference.value) return

  ErrorMessage.value = ''; // Limpar mensagens anteriores

  storeError.resetMessages();

  const fieldErrors = {}

  if (type.value === 'MBWAY' && !/^9\d{8}$/.test(reference.value)) {
    fieldErrors.reference = ['MBWAY must contain 9 digits starting with 9.'];
  } else if (type.value === 'PAYPAL' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reference.value)) {
    fieldErrors.reference = ['PAYPAL requires a valid email.'];
  } else if (type.value === 'IBAN' && !/^[A-Z]{2}\d{23}$/.test(reference.value)) {
    fieldErrors.reference = ['IBAN must contain 2 letters followed by 23 digits.'];
  } else if (type.value === 'MB' && !/^\d{5}-\d{9}$/.test(reference.value)) {
    fieldErrors.reference = ['MB must contain 5 digits, a hyphen, and 9 digits (e.g., 12345-123456789).'];
  } else if (type.value === 'VISA' && !/^4\d{15}$/.test(reference.value)) {
    fieldErrors.reference = ['VISA must contain 16 digits starting with 4.'];
  } else if (!type.value || !reference.value) {
    fieldErrors.reference = ['All fields must be filled out.'];
  }

  if (Object.keys(fieldErrors).length > 0) {
    storeError.setErrorMessages('Erro de validação.', fieldErrors, 422, 'Validation Error!')
    return
  }


  try {
      const paymentResponse = await axios.post('https://dad-202425-payments-api.vercel.app/api/debit',
      {
        type: type.value,
        reference: reference.value,
        value: product.price,
      }
    );


    if (paymentResponse.data.status === 'valid') {

      await logTransaction();

    } else {
      storeError.setErrorMessages(paymentResponse.data.message, [], 500, 'Server Error!');
    }
  } catch (err) {

    storeError.setErrorMessages(err.response.data.message, [], 400, 'Error!');

  }
}

// Function to log the transaction
async function logTransaction() {
  try {
    const transactionDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log(transactionDate)
    console.log(storeAuth.userId)
    console.log(product.brainCoins)
    console.log(product.price)
    console.log(type.value)
    console.log(reference.value)

    let storedToken = localStorage.getItem('token')
    if (storedToken) {
      axios.defaults.headers.common.Authorization = 'Bearer ' + storedToken
      await axios.post('transactions',
        {
          transaction_datetime: transactionDate,
          user_id: storeAuth.userId,
          type: 'P',
          brain_coins: product.brainCoins,
          euros: product.price,
          payment_type: type.value,
          payment_reference: reference.value,
        }
      )

      storeAuth.addBrainCoins(product.brainCoins)

      router.push({ name: 'shop' });

      storeSuccess.setSuccessMessages('Bought Successful, Thank You! ', 'Buy Offer');
    }


  } catch (err) {
    console.error(err);
    storeError.setErrorMessages("Error on regist transation", [], 500, 'Server Error!');
  }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen">
    <div class="w-80 p-6 bg-white rounded-lg shadow-lg">
      <!-- Product Image -->
      <div class="w-full aspect-w-4 aspect-h-3 mb-4">
        <img :src="product?.image" alt="product image" class="w-full h-full object-cover rounded" />
      </div>

      <!-- Form Fields -->
      <div class="space-y-4">
        <!-- Payment Type -->
        <select v-model="type" class="w-full p-2 border border-gray-300 rounded">
          <option value="" disabled>Select the payment type</option>
          <option value="MBWAY">MBWAY</option>
          <option value="PAYPAL">PAYPAL</option>
          <option value="IBAN">IBAN</option>
          <option value="MB">MB</option>
          <option value="VISA">VISA</option>
        </select>

        <!-- Payment Reference -->
        <input
          v-model="reference"
          type="text"
          placeholder="Reference"
          class="w-full p-2 border border-gray-300 rounded"
        />

        <!-- Error Message -->
        <ErrorMessage :errorMessage="storeError.fieldMessage('reference')"></ErrorMessage>

        <!-- Pay Button -->
        <button
          @click="processPayment"
          class="w-full bg-blue-600 text-white py-2 rounded"
        >
          Pay {{ product?.price }}€
        </button>

        <!-- Cancel Button -->
        <button
          @click="router.push({ name: 'shop' })"
          class="w-full bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
