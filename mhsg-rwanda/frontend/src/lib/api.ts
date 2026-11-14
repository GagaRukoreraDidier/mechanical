import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
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
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("refresh_token")
      if (refreshToken && !error.config._retry) {
        error.config._retry = true
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/token/refresh/`,
            { refresh: refreshToken }
          )
          const newAccess = res.data.access
          localStorage.setItem("access_token", newAccess)
          error.config.headers.Authorization = `Bearer ${newAccess}`
          return api(error.config)
        } catch (refreshErr) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          localStorage.removeItem("user")
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
