<script setup>
import { ref } from 'vue';

// State
const isVisible = ref(false);
const inputValue = ref('');
let onConfirm = null;


// Props
const props = defineProps({
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: '' },
});

// Methods
const open = (confirmCallback) => {
  inputValue.value = '';
  onConfirm = confirmCallback;
  isVisible.value = true;
};

const confirm = () => {
  if (onConfirm) onConfirm();
  close();
};

const cancel = () => {
  close();
};

const close = () => {
  isVisible.value = false;
};

defineExpose({ open });
</script>



<template>
  <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <h2 class="text-lg font-semibold text-purple-600">{{ title }}</h2>
      <p class="mt-2 text-gray-700">{{ message }}</p>
      <input
        v-model="inputValue"
        type="text"
        placeholder="Type DELETE"
        class="mt-4 w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <div class="mt-6 flex justify-end space-x-4">
        <button
          @click="cancel"
          class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          @click="confirm"
          :disabled="inputValue !== 'DELETE'"
          class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

