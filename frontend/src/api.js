import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const apiClient = axios.create({
    baseURL: import.meta.env.DEV ? '/api' : `${API_URL}/api`
})

export const registerTeam = async (formData) => {
    return apiClient.post('/register', formData)
}
