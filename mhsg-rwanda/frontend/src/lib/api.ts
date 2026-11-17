import axios from "axios"

const api = axios.create({
  baseURL: typeof window !== "undefined" ? "/api/v1" : "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

// Attach JWT access token from localStorage / cookie if available
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error)
  }
)

export default api
