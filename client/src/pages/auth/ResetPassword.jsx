import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Timer } from "lucide-react"

import api from "@/services/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
} from "@/components/ui/card"

const ResetPassword = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()

    const inputRefs = useRef([])

    const [email] = useState(location.state?.email || searchParams.get("email") || "")
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""])
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [timeLeft, setTimeLeft] = useState(119)

    useEffect(() => {
        if (!email) {
            toast.error("Email not found. Please start over.")
            navigate("/forgot-password")
        }
    }, [email, navigate])

    useEffect(() => {
        if (timeLeft <= 0) return
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
        return () => clearInterval(timer)
    }, [timeLeft])

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60)
        const sec = seconds % 60
        return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    }

    const maskedEmail = email
        ? email.replace(/^(.{2})(.*)(@.*)$/, (_, start, middle, end) => {
            return `${start}${"*".repeat(Math.min(middle.length, 4))}${end}`
        })
        : ""

    const handleOtpChange = (e, index) => {
        const value = e.target.value.replace(/[^0-9]/g, "")

        if (!value) {
            const updated = [...otpDigits]
            updated[index] = ""
            setOtpDigits(updated)
            return
        }

        const updated = [...otpDigits]
        updated[index] = value[0]
        setOtpDigits(updated)

        if (index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pastedValue = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6)
        if (!pastedValue) return

        const updated = ["", "", "", "", "", ""]
        pastedValue.split("").forEach((digit, index) => {
            updated[index] = digit
        })
        setOtpDigits(updated)

        const nextIndex = pastedValue.length >= 6 ? 5 : pastedValue.length
        inputRefs.current[nextIndex]?.focus()
    }

    const handleResend = async () => {
        try {
            setLoading(true)
            const res = await api.post("/users/forgot-password", { email })
            toast.success(res.data?.message || "New OTP sent successfully")
            setOtpDigits(["", "", "", "", "", ""])
            setTimeLeft(119)
            inputRefs.current[0]?.focus()
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend OTP")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const otp = otpDigits.join("")

        if (otp.length !== 6) {
            toast.error("Please enter the complete 6-digit OTP")
            return
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        try {
            setLoading(true)

            const res = await api.post("/users/reset-password", {
                email,
                otp,
                newPassword,
            })

            toast.success(res.data?.message || "Password reset successfully")
            navigate("/login")
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f9faf6] px-4 py-10 text-[#1a1c1a]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-[10%] -top-[20%] h-[600px] w-[600px] rounded-full bg-[#03271a]/5 blur-[120px]" />
                <div className="absolute -bottom-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-[#4c6455]/5 blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="mb-10 flex flex-col items-center text-center">
                    <div className="mb-8 inline-flex items-center justify-center rounded-full bg-[#c5ebd7] p-4">
                        <KeyRound className="h-8 w-8 text-[#03271a]" />
                    </div>

                    <h1 className="mb-2 text-4xl font-semibold tracking-tight text-[#03271a]">
                        Reset your password
                    </h1>

                    <p className="max-w-[330px] text-base text-[#414844]">
                        Enter the 6-digit code sent to{" "}
                        <span className="font-bold text-[#1a1c1a]">{maskedEmail}</span>
                        {" "}and choose a new password
                    </p>
                </div>

                <Card className="rounded-3xl border border-white/40 bg-white/70 p-0 shadow-[0_40px_60px_-15px_rgba(10,20,16,0.08)] backdrop-blur-2xl">
                    <CardContent className="p-8 md:p-10">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                                {otpDigits.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => {
                                            inputRefs.current[index] = el
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        autoFocus={index === 0}
                                        className="h-14 w-11 rounded-xl border border-[#dfe6df] bg-[#f3f4f0] text-center text-2xl font-bold text-[#03271a] outline-none transition-all duration-300 focus:border-[#03271a] focus:bg-white focus:ring-2 focus:ring-[#03271a] sm:h-16 sm:w-12"
                                    />
                                ))}
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                {timeLeft > 0 ? (
                                    <p className="flex items-center gap-1.5 text-xs text-[#414844]">
                                        <Timer className="h-4 w-4" />
                                        Resend code in{" "}
                                        <span className="font-bold text-[#03271a]">
                                            {formatTime(timeLeft)}
                                        </span>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        className="text-xs font-bold text-[#03271a] hover:underline"
                                    >
                                        Resend Code
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="newPassword"
                                        className="ml-1 text-xs font-semibold uppercase tracking-wide text-[#414844]"
                                    >
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
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

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="confirmPassword"
                                        className="ml-1 text-xs font-semibold uppercase tracking-wide text-[#414844]"
                                    >
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="rounded-2xl border-transparent bg-[#e8ede9] px-5 py-6 text-base focus:bg-white focus:ring-1 focus:ring-[#03271a]"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-full bg-[#03271a] py-6 text-base font-bold text-white shadow-xl shadow-[#03271a]/20 hover:bg-[#03271a]/90 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-12 flex justify-center">
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
        </main>
    )
}

export default ResetPassword
