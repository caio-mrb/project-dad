<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useErrorStore } from '@/stores/error';
import ErrorMessage from '@/components/common/ErrorMessage.vue';

const storeError = useErrorStore();
const authStore = useAuthStore();
const router = useRouter();

const form = ref({
  password_old: '',
  password: '',
  password_confirm: '',
});

const validateResetForm = () => {
  storeError.resetMessages();
  const fieldErrors = {};

  if (!form.value.password_old) {
    fieldErrors.password_old = ['Current password is required.'];
  }

  if (!form.value.password) {
    fieldErrors.password = ['New password is required.'];
  } else if (form.value.password.length < 3) {
    fieldErrors.password = ['New password must be at least 6 characters.'];
  }

  if (form.value.password !== form.value.password_confirm) {
    fieldErrors.password_confirm = ['Passwords do not match.'];
  }

  if (Object.keys(fieldErrors).length > 0) {
    storeError.setErrorMessages('Validation Error.', fieldErrors, 400, 'Validation Error!');
    return false;
  }

  return true;
};

const resetPassword = async () => {
  if (!validateResetForm()) {
    return;
  }

  await authStore.resetPassword(form.value);

};
</script>

<template>
  <div class="flex justify-center items-center min-h-screen">
    <div class="bg-white shadow-lg rounded-lg max-w-md w-full p-6">
      <h1 class="text-center text-2xl font-semibold text-blue-600">Reset Password</h1>
      <form @submit.prevent="resetPassword">
        <!-- Current Password -->
        <div class="mt-4">
          <label class="block text-gray-700 font-medium">Current Password</label>
          <input
            v-model="form.password_old"
            type="password"
            class="w-full border rounded px-3 py-2 mt-1"
            placeholder="Enter your current password"
          />
          <ErrorMessage :errorMessage="storeError.fieldMessage('currentPassword')"></ErrorMessage>
        </div>

        <!-- New Password -->
        <div class="mt-4">
          <label class="block text-gray-700 font-medium">New Password</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full border rounded px-3 py-2 mt-1"
            placeholder="Enter your new password"
          />
          <ErrorMessage :errorMessage="storeError.fieldMessage('newPassword')"></ErrorMessage>
        </div>

        <!-- Confirm New Password -->
        <div class="mt-4">
          <label class="block text-gray-700 font-medium">Confirm New Password</label>
          <input
            v-model="form.password_confirm"
            type="password"
            class="w-full border rounded px-3 py-2 mt-1"
            placeholder="Confirm your new password"
          />
          <ErrorMessage :errorMessage="storeError.fieldMessage('confirmPassword')"></ErrorMessage>
        </div>

        <!-- Buttons -->
        <div class="mt-6 flex justify-between">
          <button
            type="button"
            @click="router.push({ name: 'profile' })"
            class="bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            Reset Password
          </button>

        </div>
      </form>
    </div>
  </div>
</template>