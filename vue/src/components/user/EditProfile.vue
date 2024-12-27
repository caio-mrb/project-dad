<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import userPicture from '@/assets/avatar/avatar-none.png';
import { useErrorStore } from '@/stores/error'
import ErrorMessage from '@/components/common/ErrorMessage.vue';

const storeError = useErrorStore()
const authStore = useAuthStore();
const router = useRouter();


// Dados do formulário inicializados com o usuário atual
const form = ref({
  nickname: authStore.user.nickname || '',
  name: authStore.user.name || '',
  email: authStore.user.email || '',
  photo: null
});

const imagePreview = ref(authStore.userPhotoUrl);

// Referência ao input invisível
const fileInputRef = ref(null);

const triggerFileInput = () => {
  fileInputRef.value.click();
};

// Atualiza a pré-visualização quando o usuário faz upload
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result; // Atualiza a pré-visualização
    };
    reader.readAsDataURL(file);
    form.value.photo = file; // Armazena o arquivo
  }
};

const removeImage = async () => {
  try {
    const response = await fetch(userPicture);
    const blob = await response.blob();

    const file = new File([blob], "userPicture.png", { type: blob.type });

    form.value.photo = file;

    imagePreview.value = userPicture;
  } catch (error) {
    console.error("Erro ao carregar a imagem:", error);
    storeError.setErrorMessages("Não foi possível remover a imagem.");
  }
};


const saveProfile = async () => {

    await authStore.updateUser(form.value);
};

const cancelEdit = () => {
  router.push({ name: 'profile' });
};


</script>

<template>
  <div class="flex justify-center items-center min-h-screen">
    <div class="bg-white shadow-lg rounded-lg max-w-md w-full p-6">
      <h1 class="text-center text-2xl font-semibold text-purple-600">Edit Profile</h1>
      <form @submit.prevent="saveProfile">
        <!-- Nickname -->
        <div class="mt-4">
          <label class="block text-gray-700 font-medium">Nickname</label>
          <input
            v-model="form.nickname"
            type="text"
            class="w-full border rounded px-3 py-2 mt-1"
            placeholder="Enter your nickname"
          />
          <ErrorMessage :errorMessage="storeError.fieldMessage('nickname')"></ErrorMessage>
        </div>

        <!-- Full Name -->
        <div class="mt-4">
          <label class="block text-gray-700 font-medium">Full Name</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full border rounded px-3 py-2 mt-1"
            placeholder="Enter your full name"
          />
          <ErrorMessage :errorMessage="storeError.fieldMessage('name')"></ErrorMessage>

        </div>

        <!-- Email -->
        <div class="mt-4">
          <label class="block text-gray-700 font-medium">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full border rounded px-3 py-2 mt-1"
            placeholder="Enter your email"
          />
          <ErrorMessage :errorMessage="storeError.fieldMessage('email')"></ErrorMessage>
        </div>

        <!-- Image Upload -->
        <div class="mt-4">
          <label class="block text-gray-700 font-medium mb-2">Profile Picture</label>
          <div class="flex items-center space-x-4">
            <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" />
            </div>
            <div class="space-y-2">
              <button
                type="button"
                @click="triggerFileInput"
                class="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700"
              >
                Upload
              </button>
              <button
                type="button"
                @click="removeImage"
                class="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
          <!-- Input invisível -->
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageUpload"
          />
        </div>

        <!-- Buttons -->
        <div class="mt-6 flex justify-between">
          <button
            type="button"
            @click="cancelEdit"
            class="bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600"
          >
            Cancel
          </button>

          <button
            type="button"
            @click="router.push({ name: 'resetPassword' })"
            class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            Reset Password
        </button>

        <button
            type="submit"
            class="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700"
          >
            Save
          </button>

        </div>
      </form>
    </div>
  </div>
</template>
