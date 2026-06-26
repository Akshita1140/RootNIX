import axios from "axios"

// in-memory token store — never touches localStorage
let accessToken = null;
export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
    withCredentials: true,
})

// Attach access token with every request
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken()

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

// Auto refresh access token when protected API gives 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        const isRefreshRoute = originalRequest?.url?.includes("/users/refresh-token")

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isRefreshRoute
        ) {
            originalRequest._retry = true

            try {
                const res = await api.post("/users/refresh-token")

                const newAccessToken =
                    res.data?.accessToken || res.data?.data?.accessToken

                if (newAccessToken) {
                    setAccessToken(newAccessToken)

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

                    return api(originalRequest)
                }
            } catch (refreshError) {
               
                setAccessToken(null)  // ← clear memory
                // user cleanup happens in AuthContext, not her

                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api