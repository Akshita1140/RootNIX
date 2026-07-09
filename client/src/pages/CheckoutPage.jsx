import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import {
    ShoppingBag,
    ChevronDown,
    X,
    ShieldCheck,
    ArrowRight,
    Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext.jsx"
import { fetchCart } from "@/redux/cartSlice"
import { placeOrder, clearCurrentOrder } from "@/redux/orderSlice"
import { createRazorpayOrder } from "@/services/paymentService"
import { loadRazorpayScript } from "@/lib/loadRazorpay"

const FREE_SHIPPING_THRESHOLD = 500
const SHIPPING_FEE = 40
const GST_RATE = 0.06

const emptyAddress = {
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
}

const CheckoutPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useAuth()

    const { items, totalAmount, status: cartStatus } = useSelector(
        (state) => state.cart
    )
    const { status: orderStatus } = useSelector((state) => state.order)

    const [address, setAddress] = useState(emptyAddress)
    const [paymentMethod, setPaymentMethod] = useState("razorpay")
    const [summaryOpen, setSummaryOpen] = useState(true)
    const [paying, setPaying] = useState(false)

    useEffect(() => {
        dispatch(fetchCart())
        dispatch(clearCurrentOrder())
    }, [dispatch])

    // Redirect if there's nothing to check out
    useEffect(() => {
        if (cartStatus === "succeeded" && items.length === 0) {
            toast.error("Your cart is empty")
            navigate("/cart")
        }
    }, [cartStatus, items, navigate])

    const shipping = totalAmount > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
    const tax = Math.round(totalAmount * GST_RATE)
    const total = totalAmount + shipping + tax

    const handleChange = (e) => {
        setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const validateAddress = () => {
        for (const key of Object.keys(emptyAddress)) {
            if (!address[key]?.trim()) {
                toast.error("Please fill in all shipping fields")
                return false
            }
        }
        return true
    }

    const handleCodOrder = async () => {
        const result = await dispatch(
            placeOrder({
                paymentMethod: "cod",
                shippingAddress: address,
            })
        )
        if (placeOrder.fulfilled.match(result)) {
            navigate("/order-confirmation")
        } else {
            toast.error(result.payload || "Failed to place order")
        }
    }

    const handleRazorpayOrder = async () => {
        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded) {
            toast.error("Could not load payment gateway. Check your connection.")
            return
        }

        try {
            const res = await createRazorpayOrder()
            const { orderId, amount, currency, key } = res.data.data

            const razorpay = new window.Razorpay({
                key,
                amount,
                currency,
                name: "RootNIX",
                description: "Plant order payment",
                order_id: orderId,
                prefill: {
                    name: address.fullName || user?.fullName,
                    contact: address.phone,
                    email: user?.email,
                },
                theme: { color: "#03271a" },
                handler: async (response) => {
                    const result = await dispatch(
                        placeOrder({
                            paymentMethod: "razorpay",
                            shippingAddress: address,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        })
                    )
                    if (placeOrder.fulfilled.match(result)) {
                        navigate("/order-confirmation")
                    } else {
                        toast.error(
                            result.payload ||
                                "Payment succeeded but order creation failed. Contact support."
                        )
                    }
                },
                modal: {
                    ondismiss: () => setPaying(false),
                },
            })

            razorpay.on("payment.failed", () => {
                toast.error("Payment failed. Please try again.")
                setPaying(false)
            })

            razorpay.open()
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Could not initiate payment"
            )
            setPaying(false)
        }
    }

    const handlePay = async () => {
        if (!validateAddress()) return
        setPaying(true)

        if (paymentMethod === "cod") {
            await handleCodOrder()
            setPaying(false)
        } else {
            await handleRazorpayOrder()
            // setPaying(false) handled by modal dismiss/handler above
        }
    }

    const isSubmitting = paying || orderStatus === "loading"

    return (
        <main className="min-h-screen bg-[#f9faf6] text-[#1a1c1a]">
            {/* Header */}
            <header className="fixed top-0 z-50 w-full border-b border-transparent bg-[#f9faf6]/80 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(10,20,16,0.08)]">
                <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
                    <span className="text-2xl font-bold tracking-tight text-[#03271a]">
                        RootNIX
                    </span>
                    <button
                        onClick={() => navigate("/cart")}
                        className="text-[#414844]"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-lg px-4 pb-40 pt-24">
                {/* Step Indicator */}
                <section className="relative mb-10 flex items-center justify-between px-2">
                    <div className="absolute left-0 top-1/2 -z-10 h-[2px] w-full -translate-y-1/2 bg-[#e7e9e5]" />
                    <div className="absolute left-0 top-1/2 -z-10 h-[2px] w-2/3 -translate-y-1/2 bg-[#03271a] transition-all duration-700" />
                    {["Shipping", "Payment", "Review"].map((step, idx) => (
                        <div key={step} className="flex flex-col items-center gap-2">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                    idx <= 1
                                        ? "bg-[#03271a] text-white shadow-lg"
                                        : "bg-[#e2e3df] text-[#414844]"
                                }`}
                            >
                                {idx + 1}
                            </div>
                            <span
                                className={`text-xs font-semibold ${
                                    idx <= 1 ? "text-[#03271a]" : "text-[#414844]"
                                }`}
                            >
                                {step}
                            </span>
                        </div>
                    ))}
                </section>

                {/* Shipping Form */}
                <section className="mb-10">
                    <h2 className="mb-6 text-xl font-bold text-[#03271a]">
                        Shipping Address
                    </h2>
                    <form className="grid grid-cols-1 gap-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-[#414844]">
                                Full Name
                            </Label>
                            <Input
                                name="fullName"
                                value={address.fullName}
                                onChange={handleChange}
                                placeholder="Full Name"
                                className="rounded-xl border-transparent bg-[#f3f4f0] px-4 py-6 text-base focus:bg-white focus:ring-1 focus:ring-[#03271a]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-[#414844]">
                                Phone Number
                            </Label>
                            <Input
                                name="phone"
                                type="tel"
                                value={address.phone}
                                onChange={handleChange}
                                placeholder="Phone Number"
                                className="rounded-xl border-transparent bg-[#f3f4f0] px-4 py-6 text-base focus:bg-white focus:ring-1 focus:ring-[#03271a]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-[#414844]">
                                Address Line
                            </Label>
                            <textarea
                                name="addressLine"
                                value={address.addressLine}
                                onChange={handleChange}
                                placeholder="House No, Street, Landmark"
                                rows={3}
                                className="w-full rounded-xl border border-transparent bg-[#f3f4f0] px-4 py-4 text-base outline-none transition-all focus:bg-white focus:ring-1 focus:ring-[#03271a]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wide text-[#414844]">
                                    City
                                </Label>
                                <Input
                                    name="city"
                                    value={address.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    className="rounded-xl border-transparent bg-[#f3f4f0] px-4 py-6 text-base focus:bg-white focus:ring-1 focus:ring-[#03271a]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wide text-[#414844]">
                                    State
                                </Label>
                                <Input
                                    name="state"
                                    value={address.state}
                                    onChange={handleChange}
                                    placeholder="State"
                                    className="rounded-xl border-transparent bg-[#f3f4f0] px-4 py-6 text-base focus:bg-white focus:ring-1 focus:ring-[#03271a]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-[#414844]">
                                Pincode
                            </Label>
                            <Input
                                name="pincode"
                                value={address.pincode}
                                onChange={handleChange}
                                placeholder="Pincode"
                                className="rounded-xl border-transparent bg-[#f3f4f0] px-4 py-6 text-base focus:bg-white focus:ring-1 focus:ring-[#03271a]"
                            />
                        </div>
                    </form>
                </section>

                {/* Payment Method */}
                <section className="mb-10">
                    <h2 className="mb-4 text-xl font-bold text-[#03271a]">
                        Payment Method
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("razorpay")}
                            className={`rounded-2xl border-2 p-4 text-left transition-colors ${
                                paymentMethod === "razorpay"
                                    ? "border-[#03271a] bg-white"
                                    : "border-transparent bg-[#f3f4f0] opacity-70"
                            }`}
                        >
                            <p className="font-bold text-[#1a1c1a]">Pay Online</p>
                            <p className="text-xs text-[#414844]">
                                Cards, UPI, Netbanking
                            </p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("cod")}
                            className={`rounded-2xl border-2 p-4 text-left transition-colors ${
                                paymentMethod === "cod"
                                    ? "border-[#03271a] bg-white"
                                    : "border-transparent bg-[#f3f4f0] opacity-70"
                            }`}
                        >
                            <p className="font-bold text-[#1a1c1a]">Cash on Delivery</p>
                            <p className="text-xs text-[#414844]">Pay when it arrives</p>
                        </button>
                    </div>
                </section>

                {/* Order Summary Accordion */}
                <section className="mb-10">
                    <button
                        onClick={() => setSummaryOpen((prev) => !prev)}
                        className="flex w-full items-center justify-between rounded-2xl bg-[#e7e9e5] p-5"
                    >
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="h-5 w-5 text-[#03271a]" />
                            <span className="font-bold text-[#1a1c1a]">
                                Order Summary ({items.length} Items)
                            </span>
                        </div>
                        <ChevronDown
                            className={`h-5 w-5 transition-transform ${
                                summaryOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {summaryOpen && (
                        <div className="mt-4 space-y-4 px-2">
                            {items.map((item) => {
                                const product = item.productId
                                if (!product) return null
                                return (
                                    <div key={product._id} className="flex gap-4">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#e2e3df]">
                                            {product.images?.[0]?.url && (
                                                <img
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-start justify-between">
                                                <h4 className="text-sm font-bold">
                                                    {product.name}
                                                </h4>
                                                <span className="text-sm font-bold">
                                                    ₹{product.price * item.quantity}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs uppercase tracking-widest text-[#414844]">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}

                            <hr className="my-4 border-[#c1c8c2]/30" />

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-[#414844]">
                                    <span>Subtotal</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                                <div className="flex justify-between text-sm text-[#414844]">
                                    <span>Delivery</span>
                                    <span
                                        className={
                                            shipping === 0
                                                ? "font-semibold text-[#2c4d3f]"
                                                : ""
                                        }
                                    >
                                        {shipping === 0 ? "FREE" : `₹${shipping}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm text-[#414844]">
                                    <span>Tax (GST 6%)</span>
                                    <span>₹{tax}</span>
                                </div>
                                <div className="flex justify-between border-t border-[#c1c8c2]/10 pt-2 font-black text-[#03271a]">
                                    <span>Total</span>
                                    <span>₹{total}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* Payment Footer */}
            <div className="fixed bottom-0 left-0 z-50 w-full rounded-t-[40px] border border-white/40 bg-white/70 p-6 backdrop-blur-xl">
                <div className="mx-auto flex max-w-lg flex-col gap-4">
                    {paymentMethod === "razorpay" && (
                        <div className="mb-1 flex items-center justify-center gap-2 text-xs text-[#414844]/60">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Secured by Razorpay</span>
                        </div>
                    )}
                    <Button
                        onClick={handlePay}
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#03271a] py-6 font-bold tracking-tight text-white shadow-xl transition-all hover:scale-[1.02] hover:bg-[#03271a]/90 active:scale-95"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                {paymentMethod === "cod"
                                    ? "PLACE ORDER"
                                    : `PAY ₹${total} SECURELY`}
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </main>
    )
}

export default CheckoutPage
