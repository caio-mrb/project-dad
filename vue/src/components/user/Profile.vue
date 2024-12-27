<script setup>
import userPicture from '@/assets/avatar/avatar-none.png';
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import InputDialog from '@/components/common/InputDialog.vue';

// Store and Router
const storeAuth = useAuthStore();
const router = useRouter();

// Alert dialog ref
const inputDialog = ref(null);

// Computed properties for user data
const userPhotoUrl = computed(() => storeAuth.userPhotoUrl || userPicture);
const userNickname = computed(() => storeAuth.userNickname);
const userFullName = computed(() => storeAuth.userName);
const userEmail = computed(() => storeAuth.userEmail);
const userType = computed(() => storeAuth.userType);
const userBalance = computed(() => storeAuth.userBalance);

// Computed property for display user type
const displayUserType = computed(() => {
  return userType.value == "P" ? "Player" : "Admin";
});

// Navigate to edit page
const goToEditPage = () => {
  router.push({ name: 'editProfile' });
};

// Open delete account dialog
const deleteAccount = () => {
  inputDialog.value.open(() => {
    storeAuth.deleteUser();
  });
};
</script>

<template>
  <InputDialog
    ref="inputDialog"
    title="Delete Account?"
    message="Type DELETE to confirm account deletion."
  />
  <div class="flex justify-center items-center min-h-screen">
    <div class="bg-white shadow-lg rounded-lg max-w-md w-full p-6">
      <!-- Profile Picture -->
      <div class="flex justify-center">
        <img
          :src="userPhotoUrl"
          alt="User Avatar"
          class="w-24 h-24 rounded-full border-2 border-purple-500"
        />
      </div>
      <!-- Name, Nickname, Gender, and Type -->
      <p class="text-center text-gray-600"><strong>{{ displayUserType }} </strong></p>

      <h1 class="text-center text-2xl font-semibold mt-4 text-purple-600">
        {{ userFullName }}
      </h1>
      <p class="text-center text-gray-600"><strong>Nickname:</strong> {{ userNickname }}</p>
      <p class="text-center text-gray-500">{{ userEmail }}</p>

      <!-- Balance -->
      <div v-if="storeAuth.userType == 'P'" class="mt-4">
        <h2 class="text-purple-500 text-lg font-semibold">Balance</h2>
        <p class="text-gray-800 text-lg">{{ userBalance }} Braincoins</p>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-between">
        <button
          type="button"
          @click="router.push({ name: 'Home' })"
          class="bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600"
        >
          Voltar
        </button>

        <button
          @click="goToEditPage"
          class="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700"
        >
          Edit Profile
        </button>
        <button
          v-if="storeAuth.userType == 'P'"
          @click="deleteAccount"
          class="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
        >
          Delete Account
        </button>
      </div>
    </div>
  </div>
</template>
