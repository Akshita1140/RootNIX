import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { ArrowRight, Loader2 } from "lucide-react"

import api from "@/services/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
} from "@/components/ui/card"

const Register = () => {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
        city: "",
        pincode: ""
    })

    const [termsAccepted, setTermsAccepted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!termsAccepted) {
            toast.error("Please accept the terms and privacy policy")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        try {
            setLoading(true)

            const { confirmPassword, ...registerData } = formData

            const res = await api.post("/users/register", registerData)

            toast.success(res.data?.message || "OTP sent successfully")

            navigate("/verify-otp", {
                state: {
                    email: formData.email
                }
            })
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f9faf6] text-[#1a1c1a] overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 z-50 w-full border-b border-[#c1c8c2]/30 bg-[#f9faf6]/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-16">
                    <h1 className="text-3xl font-extrabold tracking-tighter text-[#03271a]">
                        RootNIX
                    </h1>

                    <div className="hidden items-center gap-8 md:flex">
                        <a className="text-xs font-semibold uppercase tracking-wide text-[#414844] hover:text-[#03271a]">
                            Marketplace
                        </a>
                        <a className="text-xs font-semibold uppercase tracking-wide text-[#414844] hover:text-[#03271a]">
                            AI Identifier
                        </a>
                        <a className="text-xs font-semibold uppercase tracking-wide text-[#414844] hover:text-[#03271a]">
                            Exchange
                        </a>
                        <a className="text-xs font-semibold uppercase tracking-wide text-[#414844] hover:text-[#03271a]">
                            Community
                        </a>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/login")}
                            className="font-bold text-[#03271a]"
                        >
                            Sign In
                        </Button>

                        <Button className="rounded-full bg-[#03271a] px-6 text-white hover:bg-[#03271a]/90">
                            Get Started
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-16 pt-32 md:px-16">
                <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#c5ebd7]/30 blur-[120px]" />
                <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#cee9d6]/30 blur-[120px]" />

                <Card className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[40px] border border-white/40 bg-white/70 shadow-[0_40px_60px_-15px_rgba(10,20,16,0.08)] backdrop-blur-2xl md:grid-cols-2">
                    <div className="relative hidden min-h-[580px] bg-[#e7eee8] md:block">
                        <img
                            src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80"
                            alt="Lush green plant leaves"
                            className="absolute inset-0 h-full w-full object-cover object-bottom"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#03271a]/75 via-[#03271a]/15 to-white/10" />

                        <div className="absolute bottom-16 left-12 right-12 text-white">
                            <h2 className="mb-4 text-4xl font-semibold tracking-tight">
                                Cultivate Your Digital Garden
                            </h2>
                            <p className="text-base opacity-90">
                                Join the most advanced plant ecosystem where AI meets nature’s timeless beauty.
                            </p>
                        </div>
                    </div>

                    {/* Right Form */}
                    <CardContent className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
                        <div className="mb-9">
                            <h1 className="mb-2 text-4xl font-semibold tracking-tight text-[#03271a]">
                                Create Account
                            </h1>
                            <p className="text-[#414844]">
                                Start your journey with RootNIX today.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="rounded-2xl bg-[#f3f4f0] py-6"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="rounded-2xl bg-[#f3f4f0] py-6"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="rounded-2xl bg-[#f3f4f0] py-6"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="rounded-2xl bg-[#f3f4f0] py-6"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        type="text"
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        className="rounded-2xl bg-[#f3f4f0] py-6"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pincode">Pincode</Label>
                                    <Input
                                        id="pincode"
                                        name="pincode"
                                        type="text"
                                        placeholder="Pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        required
                                        className="rounded-2xl bg-[#f3f4f0] py-6"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <p className="px-1 text-xs font-semibold uppercase tracking-widest text-[#03271a]">
                                    Account Type
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#f3f4f0] p-3 transition hover:ring-1 hover:ring-[#436556]">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="user"
                                            checked={formData.role === "user"}
                                            onChange={handleChange}
                                            className="accent-[#03271a]"
                                        />
                                        <span className="text-sm text-[#414844]">
                                            User
                                        </span>
                                    </label>

                                    <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#f3f4f0] p-3 transition hover:ring-1 hover:ring-[#436556]">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="seller"
                                            checked={formData.role === "seller"}
                                            onChange={handleChange}
                                            className="accent-[#03271a]"
                                        />
                                        <span className="text-sm text-[#414844]">
                                            Seller
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <label className="flex cursor-pointer items-start gap-3 px-1">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="mt-1 accent-[#03271a]"
                                />
                                <span className="text-xs text-[#414844]">
                                    I agree to the{" "}
                                    <a className="font-bold text-[#03271a] underline">
                                        Terms of Service
                                    </a>{" "}
                                    and{" "}
                                    <a className="font-bold text-[#03271a] underline">
                                        Privacy Policy
                                    </a>.
                                </span>
                            </label>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-2xl bg-[#03271a] py-6 text-base font-bold text-white shadow-lg shadow-[#03271a]/20 hover:bg-[#03271a]/90 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Register Account
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-[#414844]">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="font-bold text-[#03271a] hover:underline"
                                >
                                    Log in
                                </button>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

export default Register