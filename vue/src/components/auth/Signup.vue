<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { Button } from '@/components/ui/button'
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import { useErrorStore } from '@/stores/error'

  import { useSignupStore } from '@/stores/signup'

  import ErrorMessage from '@/components/common/ErrorMessage.vue';
  import userPicture from '@/assets/avatar/avatar-none.png';
  import avatar1 from '@/assets/avatar/avatar-1.png';
  import avatar2 from '@/assets/avatar/avatar-2.png';
  import avatar3 from '@/assets/avatar/avatar-3.png';

  import { useAuthStore } from '@/stores/auth';

  const storeAuth = useAuthStore();

  const storeSignup = useSignupStore()

  const storeError = useErrorStore()

  const router = useRouter()

  const previewImage = ref(userPicture);

  const predefinedAvatars = [avatar1, avatar2, avatar3];
  let currentAvatarIndex = 0

  const fileInput = ref(null);


  const toggleAvatar = async () => {
  // Alterar o índice do avatar
  currentAvatarIndex = (currentAvatarIndex + 1) % predefinedAvatars.length;

  // Atualizar a imagem de visualização
  previewImage.value = predefinedAvatars[currentAvatarIndex];

  // Supondo que predefinedAvatars é uma lista de URLs, use a URL do avatar
  const avatarUrl = predefinedAvatars[currentAvatarIndex];

  // Baixar o avatar e converter para Blob
  try {
    const response = await fetch(avatarUrl);
    if (!response.ok) {
      throw new Error('Falha ao baixar o avatar');
    }

    const blob = await response.blob();
    const file = new File([blob], `avatar-${currentAvatarIndex}.png`, { type: blob.type });

    // Atualizar o `credentials.value.photo` com o novo arquivo de imagem
    credentials.value.photo = file;
  } catch (error) {
    console.error('Erro ao alternar avatar:', error);
  }
};



  const credentials = ref({
      photo: userPicture,
      name: '',
      nickname: '',
      email: '',
      password: ''
  })

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      credentials.value.photo = file;

      const reader = new FileReader();
      reader.onload = () => {
        previewImage.value = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };


  const removePicture = async () => {
  try {
    // Busca o conteúdo da imagem via URL
    const response = await fetch(userPicture);
    const blob = await response.blob();

    // Cria um objeto File com o conteúdo do userPicture
    const file = new File([blob], "userPicture.png", { type: blob.type });

    // Atualiza o form com o arquivo gerado
    credentials.value.photo = file;

    // Atualiza a pré-visualização
    previewImage.value = userPicture;

    fileInput.value.value = ''; 

  } catch (error) {
    console.error("Erro ao carregar a imagem:", error);
    storeError.setErrorMessages("Não foi possível remover a imagem.");
  }
};

  const triggerFileInput = () => {
      fileInput.value.click();
  };

  const cancel = () => {
    router.push({ name:'Home' })
  }

  const signup = () => {
    storeSignup.signup(credentials.value);
  };

  const initializeDefaultPhoto = async () => {
    const response = await fetch(userPicture);
    const blob = await response.blob();
    const file = new File([blob], userPicture, { type: blob.type });

    credentials.value.photo = file;
  };

  initializeDefaultPhoto();


</script>

<template>
  <Card class="w-[450px] mx-auto my-8 p-4 px-8">
    <CardHeader v-if="storeAuth.userType == 'P'">
      <CardTitle>Signup</CardTitle>
      <CardDescription>Create your account</CardDescription>
    </CardHeader>
    <CardHeader v-else>
      <CardTitle>Create an Admin account</CardTitle>
    </CardHeader>
    <CardContent>
      <form>
        <div class="grid items-center w-full gap-4">

            <div class="flex flex-col items-center">
            <Label class="mt-4" for="profile-picture">Profile Picture</Label>

            <div v-if="previewImage" class="mt-4">
              <img 
                :src="previewImage" 
                alt="Profile Preview" 
                class="w-32 h-32 object-cover rounded-full border"
              />
            </div>
            
            <div class="flex space-x-4 mt-4">
              <Button 
                v-if="previewImage !== userPicture" 
                class="bg-red-500 text-white" 
                @click="removePicture"
                type="button"
              >
                Remove Picture
              </Button>
              <Button 
                v-else
                class="bg-blue-500 text-white"
                @click="triggerFileInput"
                type="button"
              >
                Upload Picture
              </Button>

              <Button 
                class="bg-blue-500 text-white"
                @click="toggleAvatar"
                type="button"
              >
                Next Avatar
              </Button>

              <input 
                type="file" 
                ref="fileInput" 
                accept="image/*" 
                class="hidden" 
                @change="handleFileUpload"
              />
            </div>
          </div>

          <div class="flex flex-col space-y-1.5 mt-5">
            <Label for="nickname">Nickname</Label>
              <Input id="nickname" type="nickname" placeholder="User Nickname" v-model="credentials.nickname" />
              <ErrorMessage :errorMessage="storeError.fieldMessage('nickname')"></ErrorMessage>
          </div>
          <div class="flex flex-col space-y-1.5 mt-5">
            <Label for="name">Full Name</Label>
              <Input id="name" type="name" placeholder="User Full Name" v-model="credentials.name" />
              <ErrorMessage :errorMessage="storeError.fieldMessage('name')"></ErrorMessage>
          </div>
          <div class="flex flex-col space-y-1.5">
            <Label for="email">Email</Label>
              <Input id="email" type="email" placeholder="User Email" v-model="credentials.email" />
              <ErrorMessage :errorMessage="storeError.fieldMessage('email')"></ErrorMessage>
          </div>
          <div class="flex flex-col space-y-1.5">
            <Label for="password">Password</Label>
              <Input id="password" type="password" v-model="credentials.password" />
              <ErrorMessage :errorMessage="storeError.fieldMessage('password')"></ErrorMessage>
          </div>
        </div>
      </form>
    </CardContent>
    <CardFooter class="flex justify-between px-6 pb-6">
        <Button variant="outline" @click="cancel">
            Cancel
        </Button>
        <Button class="bg-purple-600" @click="signup">
            Create
        </Button>
    </CardFooter>
  </Card>
</template>