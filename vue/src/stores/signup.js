import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useSuccessStore } from '@/stores/success'
import { useRouter } from 'vue-router'

export const useSignupStore = defineStore('signup', () => {
  const router = useRouter()
  const storeError = useErrorStore()
  const storeSuccess = useSuccessStore();

  const signup = async (credentials) => {
  
    if (!validateForm(credentials)) {
      return;
    }
  
    const formData = new FormData()


    for (const key in credentials) {
      if (key === 'photo' && credentials[key] instanceof File) {
        formData.append('photo', credentials[key]);
      } else {
        formData.append(key, credentials[key]);
      }
    }
  
    try {

      let storedToken = localStorage.getItem('token');
      var response = null

      if (storedToken) {
          axios.defaults.headers.common.Authorization = 'Bearer ' + storedToken;

          response = await axios.post('users/admin', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      else
      {
         response = await axios.post('users', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
  
      if (response.data && response.data.data) {
        router.push({ name: 'login' });
        storeSuccess.setSuccessMessages('Account created successfully!', 'Signup Successful');
        return true;
      } else {
        storeError.setErrorMessages(
          'Erro desconhecido',
          [],
          response.status,
          'Create Account Error!'
        );
        return false;
      }
    } catch (e) {
      console.log(e);
  
      if (e.response && e.response.data) {
        const errorData = e.response.data;
        const fieldErrors = {};
  
        if (errorData.errors) {
          for (let field in errorData.errors) {
            fieldErrors[field] = errorData.errors[field];
          }
        }
  
        storeError.setErrorMessages(
          errorData.message,
          fieldErrors,
          e.response.status,
          'Validation Error!'
        );
  
        return false;
      } else {
        storeError.setErrorMessages('Erro desconhecido', [], 500, 'Server Error!');
        return false;
      }
    }
  };
  

  const validateForm = (credentials) => {
    storeError.resetMessages();

    const fieldErrors = {}

    if (!credentials.nickname) {
      fieldErrors.nickname = ['The nickname field is required.']
    }

    if (!credentials.name) {
        fieldErrors.name = ['The name field is required.']
    }

       // Verifica se o nickname contém espaços
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

    if (credentials.password.length < 3) {
      fieldErrors.password = ['The password field must have at least 3 characters.']
    }

    if (Object.keys(fieldErrors).length > 0) {
      storeError.setErrorMessages('Erro de validação.', fieldErrors, 400, 'Validation Error!')
      return false
    }

    return true
  }

  return {
    signup,
    validateForm
  }
})
