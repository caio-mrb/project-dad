import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useToast } from '@/components/ui/toast/use-toast';

export const useSuccessStore = defineStore('success', () => {
  const { toast } = useToast();

  const _message = ref('');
  const _title = ref('');

  const message = computed(() => _message.value.trim());
  const title = computed(() => _title.value.trim());

  const resetMessages = () => {
    _message.value = '';
    _title.value = '';
  };

  const setSuccessMessages = (mainMessage, titleMessage = 'Success') => {
    _message.value = mainMessage;
    _title.value = titleMessage;

    toast({
      title: titleMessage,
      description: mainMessage,
      variant: 'success',
    });
  };

  return {
    message,
    title,
    resetMessages,
    setSuccessMessages,
  };
});
