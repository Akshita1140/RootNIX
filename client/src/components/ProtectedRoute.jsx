import { Navigate, useLocation } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext.jsx"

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, authLoading, user } = useAuth()
    const location = useLocation()

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f9faf6]">
                <Loader2 className="h-8 w-8 animate-spin text-[#03271a]" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute
