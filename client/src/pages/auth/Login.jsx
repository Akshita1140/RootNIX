import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext.jsx"
import {
    ArrowRight,
    Eye,
    EyeOff,
    Loader2,
    Sprout,
} from "lucide-react"

import api from "@/services/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
} from "@/components/ui/card"

const Login = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { loginUser } = useAuth()

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)

            const res = await api.post("/users/login", formData)

            const loggedInUser = res.data?.user || res.data?.data?.user
            const accessToken = res.data?.accessToken || res.data?.data?.accessToken

            loginUser(loggedInUser, accessToken)

            toast.success(res.data?.message || "Login successful")
            const redirectTo = location.state?.from?.pathname || "/"
            navigate(redirectTo, { replace: true })
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed")
        } finally {
            setLoading(false)
        } 
    }

    return (
        <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#f9faf6] text-[#1a1c1a]">
            {/* Botanical background */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute left-[10%] top-[20%] h-[420px] w-[420px] rounded-full bg-[#aacfbb]/20 blur-[120px]" />
                <div className="absolute bottom-[10%] right-[8%] h-[460px] w-[460px] rounded-full bg-[#cee9d6]/30 blur-[130px]" />
                <div className="absolute inset-0 opacity-30 mix-blend-multiply">
                    <img
                        src="https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1600&q=80"
                        alt=""
                        className="h-full w-full object-cover blur-3xl grayscale"
                    />
                </div>
            </div>

            <section className="flex flex-1 items-center justify-center px-4 py-12 md:px-16">
                <div className="w-full max-w-[480px]">
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-[#c5ebd7] p-3">
                            <Sprout className="h-8 w-8 text-[#03271a]" />
                        </div>

                        <h1 className="mb-2 text-4xl font-bold tracking-tighter text-[#03271a]">
                            RootNIX
                        </h1>

                        <p className="text-base text-[#414844]">
                            Welcome back to your digital garden
                        </p>
                    </div>

                    {/* Login Card */}
                    <Card className="rounded-3xl border border-white/40 bg-white/70 shadow-[0_40px_100px_-20px_rgba(10,20,16,0.12)] backdrop-blur-2xl">
                        <CardContent className="p-8 md:p-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="ml-1 text-xs font-semibold uppercase tracking-wide text-[#414844]"
                                    >
                                        Email Address
                                    </Label>

                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="rounded-2xl border-transparent bg-[#e8ede9] px-5 py-6 text-base focus:bg-white focus:ring-1 focus:ring-[#03271a]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <Label
                                            htmlFor="password"
                                            className="text-xs font-semibold uppercase tracking-wide text-[#414844]"
                                        >
                                            Password
                                        </Label>

                                        <button
                                            type="button"
                                            onClick={() => navigate("/forgot-password")}
                                            className="text-xs font-semibold text-[#1b3d2f] transition hover:text-[#03271a] hover:underline"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="rounded-2xl border-transparent bg-[#e8ede9] px-5 py-6 pr-12 text-base focus:bg-white focus:ring-1 focus:ring-[#03271a]"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#414844] transition hover:text-[#03271a]"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="group w-full rounded-2xl bg-[#03271a] py-6 text-base font-bold text-white shadow-lg shadow-[#03271a]/10 transition hover:scale-[1.02] hover:bg-[#03271a]/90 active:scale-95"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Securing Session...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-8 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[#c1c8c2]/40" />
                                </div>
                                <span className="relative bg-white/0 px-4 text-xs font-semibold text-[#414844]">
                                    OR CONTINUE WITH
                                </span>
                            </div>

                            {/* Social Login UI */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => toast.error("Google login will be added later")}
                                    className="flex items-center justify-center gap-3 rounded-2xl bg-[#f3f4f0] px-4 py-3.5 transition hover:bg-[#edeeea]"
                                >
                                    <span className="text-sm font-semibold text-[#1a1c1a]">
                                        Google
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => toast.error("Apple login is post-MVP")}
                                    className="flex items-center justify-center gap-3 rounded-2xl bg-[#f3f4f0] px-4 py-3.5 transition hover:bg-[#edeeea]"
                                >
                                    <span className="text-sm font-semibold text-[#1a1c1a]">
                                        Apple
                                    </span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-8 text-center">
                        <p className="text-base text-[#414844]">
                            Don&apos;t have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/register")}
                                className="font-bold text-[#03271a] hover:underline"
                            >
                                Join the community
                            </button>
                        </p>
                    </div>
                </div>
            </section>

            <footer className="w-full rounded-t-3xl bg-[#e2e3df] py-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row md:px-16">
                    <p className="font-bold tracking-tighter text-[#03271a]">
                        RootNIX AI
                    </p>

                    <div className="flex flex-wrap justify-center gap-6">
                        <a className="text-xs font-semibold text-[#414844] hover:text-[#03271a]">
                            Privacy Policy
                        </a>
                        <a className="text-xs font-semibold text-[#414844] hover:text-[#03271a]">
                            Terms of Service
                        </a>
                        <a className="text-xs font-semibold text-[#414844] hover:text-[#03271a]">
                            API Help
                        </a>
                    </div>

                    <p className="text-xs font-semibold text-[#414844]/70">
                        © 2024 RootNIX AI.
                    </p>
                </div>
            </footer>
        </main>
    )
}

export default Login