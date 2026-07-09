import {  Routes, Route } from "react-router-dom"
import Register from "./pages/auth/Register"
import VerifyOtp from "./pages/auth/VerifyOtp"
import Login from "./pages/auth/Login"
import Home from "./pages/Home"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import OrderConfirmationPage from "./pages/OrderConfirmationPage"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
    return (

        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/login" element={<Login />} />
            <Route
                path="/cart"
                element={
                    <ProtectedRoute>
                        <CartPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/checkout"
                element={
                    <ProtectedRoute>
                        <CheckoutPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/order-confirmation"
                element={
                    <ProtectedRoute>
                        <OrderConfirmationPage />
                    </ProtectedRoute>
                }
            />
        </Routes>

    )
}

export default App