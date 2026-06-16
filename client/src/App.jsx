import {  Routes, Route } from "react-router-dom"
import Register from "./pages/auth/Register"
import VerifyOtp from "./pages/auth/VerifyOtp"
import Login from "./pages/auth/Login"
import Home from "./pages/Home"

function App() {
    return (

        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/login" element={<Login />} />
        </Routes>

    )
}

export default App