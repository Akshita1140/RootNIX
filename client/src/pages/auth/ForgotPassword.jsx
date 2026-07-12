import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { ArrowLeft, ArrowRight, KeyRound, Loader2 } from "lucide-react"

import api from "@/services/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
} from "@/components/ui/card"

const ForgotPassword = () => {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)

            const res = await api.post("/users/forgot-password", { email })

            toast.success(res.data?.message || "OTP sent to your email")

            navigate("/reset-password", {
                state: { email },
            })
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP")
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
            </div>

            <section className="flex flex-1 items-center justify-center px-4 py-12 md:px-16">
                <div className="w-full max-w-[480px]">
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-[#c5ebd7] p-3">
                            <KeyRound className="h-8 w-8 text-[#03271a]" />
                        </div>

                        <h1 className="mb-2 text-4xl font-bold tracking-tighter text-[#03271a]">
                            Forgot Password?
                        </h1>

                        <p className="text-base text-[#414844]">
                            Enter your email and we&apos;ll send you a code to reset it
                        </p>
                    </div>

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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="rounded-2xl border-transparent bg-[#e8ede9] px-5 py-6 text-base focus:bg-white focus:ring-1 focus:ring-[#03271a]"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="group w-full rounded-2xl bg-[#03271a] py-6 text-base font-bold text-white shadow-lg shadow-[#03271a]/10 transition hover:scale-[1.02] hover:bg-[#03271a]/90 active:scale-95"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Sending code...
                                        </>
                                    ) : (
                                        <>
                                            Send Reset Code
                                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="mt-8 flex justify-center">
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="group flex items-center gap-2 text-xs font-semibold text-[#414844] transition-colors hover:text-[#03271a]"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back to login
                        </button>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default ForgotPassword
