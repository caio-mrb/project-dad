import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useRouter } from 'vue-router'
import { useSuccessStore } from '@/stores/success'


import avatarNoneAssetURL from '@/assets/avatar/avatar-none.png'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const storeError = useErrorStore()
  const storeSuccess = useSuccessStore()
  const socket = inject('socket')

  const user = ref(null)
  const token = ref('')

  const userId = computed(() => {
    return user.value.id
  })

  const userName = computed(() => {
    return user.value ? user.value.name : ''
  })

  const userFirstName = computed(() => {
    const names = userName.value.trim().split(' ')
    const firstName = names[0] ?? ''
    return firstName.trim()
  })

  const userNickname = computed(() => {
    return user.value.nickname
  })

  const userFirstLastName = computed(() => {
    const names = userName.value.trim().split(' ')
    const firstName = names[0] ?? ''
    const lastName = names.length > 1 ? names[names.length - 1] : ''
    return (firstName + ' ' + lastName).trim()
  })

  const userEmail = computed(() => {
    return user.value ? user.value.email : ''
  })

  const userType = computed(() => {
    return user.value ? user.value.type : ''
  })

  const userPhotoUrl = computed(() => {
    const photoFile = user.value ? user.value.photo ?? '' : ''
    if (photoFile) {
        let baseURL = axios.defaults.baseURL.split("/")

        baseURL.pop()

        return baseURL.join("/") +  "/storage/photos/" + photoFile;
    }
    return avatarNoneAssetURL
})

  const userBalance = computed(() => {
    return user.value ? user.value.balance : '0'
  })


  const deleteUser = async () => {
    try {
        axios.defaults.headers.common.Authorization = 'Bearer ' + token.value
        const responseUser = await axios.delete('users')
        user.value = responseUser.data.data

        clearUser()
        router.push({ name:'Home' })
        storeSuccess.setSuccessMessages('Account deleted successfully!', 'Delete Successful');

        return true

    } catch (e) {
        console.log(e)
        clearUser()            
        storeError.setErrorMessages(e.response.data.message, e.response.data.errors, e.response.status, 'Authentication Error!')
        return false
    }
  }

  // This function is "private" - not exported by the store
  const clearUser = () => {
    resetIntervalToRefreshToken()
    if (user.value) {
        socket.emit('logout', user.value)
    }        
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    axios.defaults.headers.common.Authorization = ''        
}

const login = async (credentials) => {
  storeError.resetMessages()

  try {
      const responseLogin = await axios.post('auth/login', credentials)
      token.value = responseLogin.data.token
      localStorage.setItem('token', token.value)
      axios.defaults.headers.common.Authorization = 'Bearer ' + token.value

      const responseUser = await axios.get('users/me')
      user.value = responseUser.data.data
      socket.emit('login', user.value)
      repeatRefreshToken()
      router.push({ name:'Home' })

      return user.value
  } catch (e) {
      console.log(e)
      clearUser()            
      storeError.setErrorMessages(e.response.data.message, e.response.data.errors, e.response.status, 'Authentication Error!')
      return false
  }
}

const resetPassword = async (credentials) => {
  storeError.resetMessages()

  try {
      axios.defaults.headers.common.Authorization = 'Bearer ' + token.value
      const response = await axios.patch('users', credentials)


    if (response.data.data.message == "Password updated successfully!") {

        router.push({ name: 'profile' });
        storeSuccess.setSuccessMessages('Account password updated successfully!', 'Password Updated Successful');

        return true;
    } else {
      storeError.setErrorMessages(response.data.data.message, response.data.data.errors, response.data.data.status, 'Update Error!')
    }

  } catch (e) {
      console.log(e)
      clearUser()            
      storeError.setErrorMessages(e.response.data.message, e.response.data.errors, e.response.status, 'Update Error!')
      return false
  }

}


const formData = new FormData()

const updateUser = async (credentials) => {
  storeError.resetMessages()

  if (!validateForm(credentials)) {
    return;
  }

  console.log(credentials)

  try {

    if(credentials.nickname != user.value.nickname)
    {
      formData.append('nickname', credentials.nickname);
    }

    if(credentials.name != user.value.name)
    {
      formData.append('name', credentials.name);
    }
    
    if(credentials.email != user.value.email)
    {
      formData.append('email', credentials.email);
    }

    if(credentials.photo != null)
    {
      formData.append('photo', credentials.photo);
    }

        
    // for (const key in credentials) {
    //   if (key === 'photo' && credentials[key] instanceof File) {
    //     formData.append('photo', credentials[key]);
    //   } else {
    //     if(credentials[key] != null)
    //     {
    //       formData.append(key, credentials[key]);
    //     }
    //   }
    // }

    formData.append('_method', 'PUT')

    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    axios.defaults.headers.common.Authorization = 'Bearer ' + token.value
    const response = await axios.post('users', formData)


    if (response.data.data.message == "User updated successfully!") {

        axios.defaults.headers.common.Authorization = 'Bearer ' + token.value

        const responseUser = await axios.get('users/me')
        user.value = responseUser.data.data
        

        await router.push({ name: 'profile' });

        window.location.reload();

        storeSuccess.setSuccessMessages('Account updated successfully!', 'Update Successful');

         return true;
    } else {
      storeError.setErrorMessages(response.data.data.message, response.data.errors, response.status, 'Update Error!')
    }

  } catch (e) {
      console.log(e)
      //clearUser()            
      storeError.setErrorMessages(e.response.data.message, e.response.data.errors, e.response.status, 'Update Error!')
      return false
  }
}

const validateForm = (credentials) => {
  storeError.resetMessages();

  const fieldErrors = {}

  if (!credentials.nickname) {
    fieldErrors.nickname = ['The nickname field is required.']
  }

  if (!credentials.name) {
      fieldErrors.name = ['The name field is required.']
    }

   // Verifica se o nickname contem espaços
   if (credentials.nickname && /\s/.test(credentials.nickname)) {
    fieldErrors.nickname = ['The nickname field cannot contain spaces.'];
  }

  if (credentials.nickname.length > 15) {
      fieldErrors.nickname = ['The nickname field is too long.']
  }

  if (credentials.name.length > 30) {
      fieldErrors.name = ['The name field is too long.']
  }

  if (!credentials.email) {
      fieldErrors.email = ['The email field is required.']
    }

  if (Object.keys(fieldErrors).length > 0) {
    storeError.setErrorMessages('Erro de validação.', fieldErrors, 400, 'Validation Error!')
    return false
  }

  return true
}

const logout = async () => {
  storeError.resetMessages()
  try {
      await axios.post('auth/logout')
      clearUser()
      router.push({ name:'Home' })
      return true
  } catch (e) {
      clearUser()
      storeError.setErrorMessages(e.response.data.message, [], e.response.status, 'Authentication Error!')
      return false
  }
}

  let intervalToRefreshToken = null

  const resetIntervalToRefreshToken = () => {
    if (intervalToRefreshToken) {
      clearInterval(intervalToRefreshToken)
    }
    intervalToRefreshToken = null
  }

  const repeatRefreshToken = () => {
    if (intervalToRefreshToken) {
      clearInterval(intervalToRefreshToken)
    }
    intervalToRefreshToken = setInterval(
      async () => {
        try {
          const response = await axios.post('auth/refreshtoken')
          token.value = response.data.token
          localStorage.setItem('token', token.value)
          axios.defaults.headers.common.Authorization = 'Bearer ' + token.value
          return true
        } catch (e) {
          clearUser()
          storeError.setErrorMessages(
            e.response.data.message,
            e.response.data.errors,
            e.response.status,
            'Authentication Error!'
          )
          return false
        }
      },
      1000 * 60 * 110
    )
    return intervalToRefreshToken
  }

  const restoreToken = async function () {
    let storedToken = localStorage.getItem('token')
    if (storedToken) {
        try {
            token.value = storedToken
            axios.defaults.headers.common.Authorization = 'Bearer ' + token.value
            const responseUser = await axios.get('users/me')
            user.value = responseUser.data.data
            socket.emit('login', user.value)
            repeatRefreshToken()
            return true                 
        } catch {
            clearUser()
            return false 
        }
    }
    return false
}

const addBrainCoins = (num_coins) => {
  user.value.balance += num_coins
}

const removeBrainCoins = (num_coins) => {
  if(user.value.balance < num_coins) return false
  
  user.value.balance -= num_coins
  return true
}
const getgamesS = async ()=>{
  axios.defaults.headers.common.Authorization = 'Bearer ' + token.value
  const responseGamesS = await axios.get('games');
      return responseGamesS.data.data;
}
const getgamesM = async ()=>{
  axios.defaults.headers.common.Authorization = 'Bearer ' + token.value
  const responseGamesM = await axios.get('multiplayergames');
      return responseGamesM.data.data;
}
const getGlobalScore = async ()=>{
  const responseGamesM = await axios.get('games/global');
      return responseGamesM.data.data;
}
const getBoards = async ()=>{
  const responseBoards = await axios.get('boards');
      return responseBoards.data.data;
}
const getTransactions= async ()=>{
  const Transactions = await axios.get('transactions');
      return Transactions.data.data;
}

const getFirstLastName = (fullName) => {
  const names = fullName.trim().split(' ')
  const firstName = names[0] ?? ''
  const lastName = names.length > 1 ? names[names.length -1 ] : ''
  return (firstName + ' ' + lastName).trim()
}

  return {
    user,
    userName,
    userFirstName,
    userFirstLastName,
    userEmail,
    userType,
    userPhotoUrl,
    userBalance,
    userNickname,
    userId,
    login,
    logout,
    restoreToken,
    deleteUser,
    updateUser,
    validateForm,
    resetPassword,
    addBrainCoins,
    removeBrainCoins,
    getgamesS,
    getgamesM,
    getBoards,
    getGlobalScore,
    getTransactions,
    getFirstLastName
  }
})
