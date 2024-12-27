<script setup>
import { AlertDialogRoot, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from 'radix-vue';

defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
  },
  cancelText: {
    type: String,
  },
  onConfirm: {
    type: Function,
    required: false
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  }
});
</script>

<template>
  <AlertDialogRoot>
    <!-- Trigger Button -->
    <AlertDialogTrigger
      class="text-white hover:text-purple-300 px-3 py-2 rounded-full text-sm w-44 font-medium transition-colors bg-purple-700 shadow-md disabled:text-slate-400 disabled:bg-purple-200 disabled:cursor-not-allowed"
      :disabled="disabled"
      >
      <slot name="trigger">Open Dialog</slot>
    </AlertDialogTrigger>

    <AlertDialogPortal>
      <!-- Overlay -->
      <AlertDialogOverlay class="bg-black/50 fixed inset-0 z-30" />

      <!-- Dialog Content -->
      <AlertDialogContent
        class="z-[100] fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white shadow-lg p-6 text-gray-800 focus:outline-none border border-purple-200"
      >
        <!-- Title -->
        <AlertDialogTitle class="text-purple-700 text-lg font-bold">
          {{ title }}
        </AlertDialogTitle>

        <!-- Description -->
        <AlertDialogDescription class="text-gray-600 mt-4 mb-5 text-sm">
          {{ description }}
        </AlertDialogDescription>

        <!-- Buttons -->
        <div class="flex justify-end gap-4">
          <!-- Cancel Button -->
          <AlertDialogCancel
            v-if="cancelText"
            class="text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors focus:shadow-purple-300 inline-flex h-9 items-center justify-center rounded-md px-4 font-medium outline-none"
          >
            {{ cancelText }}
          </AlertDialogCancel>

          <!-- Confirm Button -->
          <AlertDialogAction
            v-if="confirmText"
            class="text-white bg-purple-700 hover:bg-purple-800 transition-colors focus:shadow-purple-400 inline-flex h-9 items-center justify-center rounded-md px-4 font-medium outline-none"
            @click="onConfirm"
          >
            {{ confirmText }}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
