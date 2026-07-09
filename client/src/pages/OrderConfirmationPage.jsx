import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { clearCurrentOrder } from "@/redux/orderSlice"

const OrderConfirmationPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { currentOrder } = useSelector((state) => state.order)

    // If someone lands here directly (e.g. page refresh) with no order in
    // memory, there's nothing to show — send them back rather than fake data.
    useEffect(() => {
        if (!currentOrder) {
            navigate("/", { replace: true })
        }
    }, [currentOrder, navigate])

    if (!currentOrder) return null

    const {
        _id,
        orderItems = [],
        itemsPrice,
        shippingPrice,
        totalPrice,
    } = currentOrder

    const handleContinueShopping = () => {
        dispatch(clearCurrentOrder())
        navigate("/")
    }

    return (
        <main className="min-h-screen bg-[#f9faf6] text-[#1a1c1a]">
            <div className="mx-auto w-full max-w-[420px] px-4 pb-24 pt-16">
                {/* Success Header */}
                <section className="mb-10 text-center">
                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#cbe6d4]">
                        <CheckCircle2 className="h-12 w-12 text-[#84a895]" fill="none" strokeWidth={1.5} />
                    </div>
                    <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#03271a]">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-[#414844]">
                        Your botanical journey begins soon.
                    </p>
                </section>

                {/* Order Meta */}
                <div className="mb-6 rounded-3xl border border-white/40 bg-white/40 p-6 shadow-[0_40px_80px_-15px_rgba(10,20,16,0.08)] backdrop-blur-xl">
                    <div className="mb-4 flex items-center justify-between border-b border-[#c1c8c2]/30 pb-4">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#727974]">
                                Order ID
                            </p>
                            <p className="font-bold text-[#03271a]">
                                #{_id?.slice(-8).toUpperCase()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#727974]">
                                Delivery
                            </p>
                            <p className="font-bold text-[#03271a]">2-3 business days</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-[#506859]" />
                        <p className="text-sm text-[#414844]">
                            Tracking details will be sent via email.
                        </p>
                    </div>
                </div>

                {/* Itemized Summary */}
                <section className="mb-10">
                    <h2 className="mb-4 px-1 font-bold text-[#03271a]">
                        Order Summary
                    </h2>
                    <div className="space-y-4">
                        {orderItems.map((item) => (
                            <div
                                key={item.product}
                                className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white/60 p-3 shadow-sm"
                            >
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#e2e3df]">
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-bold text-[#1a1c1a]">{item.name}</p>
                                    <p className="text-xs text-[#727974]">
                                        Qty: {item.quantity}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-[#03271a]">
                                        ₹{item.price * item.quantity}
                                    </p>
                                </div>
                            </div>
                        ))}

                        <div className="mt-4 rounded-2xl bg-[#1b3d2f]/5 p-4">
                            <div className="mb-1 flex justify-between text-[#414844]">
                                <span>Subtotal</span>
                                <span>₹{itemsPrice}</span>
                            </div>
                            <div className="mb-3 flex justify-between text-[#414844]">
                                <span>Shipping</span>
                                <span className="font-semibold text-[#84a895]">
                                    {shippingPrice === 0 ? "Free" : `₹${shippingPrice}`}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-[#c1c8c2]/30 pt-3 font-bold text-[#03271a]">
                                <span>Total Paid</span>
                                <span className="text-xl">₹{totalPrice}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Actions */}
                <section className="flex flex-col gap-3">
                    <Button
                        onClick={handleContinueShopping}
                        className="w-full rounded-full bg-[#03271a] py-6 font-bold text-white shadow-lg shadow-[#03271a]/20 transition-all hover:scale-[1.02] hover:bg-[#03271a]/90 active:scale-[0.98]"
                    >
                        CONTINUE SHOPPING
                    </Button>
                </section>
            </div>
        </main>
    )
}

export default OrderConfirmationPage
