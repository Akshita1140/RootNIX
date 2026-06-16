import { createContext, useContext, useEffect, useState } from "react"
import api from "@/services/api"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)

    const checkAuth = async () => {
        try {
            setAuthLoading(true)

            const res = await api.get("/users/current-user")

            const loggedInUser =
                res.data?.user || res.data?.data?.user || res.data?.data

            if (loggedInUser) {
                setUser(loggedInUser)
                localStorage.setItem("user", JSON.stringify(loggedInUser))
            } else {
                setUser(null)
                localStorage.removeItem("user")
            }
        } catch (error) {
            setUser(null)
            localStorage.removeItem("accessToken")
            localStorage.removeItem("user")
        } finally {
            setAuthLoading(false)
        }
    }

    const loginUser = (userData, accessToken) => {
        setUser(userData)

        if (userData) {
            localStorage.setItem("user", JSON.stringify(userData))
        }

        if (accessToken) {
            localStorage.setItem("accessToken", accessToken)
        }
    }

    const logoutUser = async () => {
        try {
            await api.post("/users/logout")
        } catch (error) {
            console.log(error)
        } finally {
            setUser(null)
            localStorage.removeItem("accessToken")
            localStorage.removeItem("user")
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                authLoading,
                checkAuth,
                loginUser,
                logoutUser,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}