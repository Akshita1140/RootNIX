import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import {
    Sprout,
    ShoppingCart,
    Trash2,
    Minus,
    Plus,
    Truck,
    ArrowRight,
    Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    fetchCart,
    updateItemQuantity,
    removeItemFromCart,
} from "@/redux/cartSlice"

const FREE_SHIPPING_THRESHOLD = 500
const SHIPPING_FEE = 40

const CartPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { items, totalItems, totalAmount, status, mutating, error } =
        useSelector((state) => state.cart)

    useEffect(() => {
        dispatch(fetchCart())
    }, [dispatch])

    useEffect(() => {
        if (error) toast.error(error)
    }, [error])

    const shipping = totalAmount > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
    const total = totalAmount + shipping
    const isEmpty = items.length === 0

    const handleQuantityChange = (productId, currentQty, delta) => {
        const newQty = currentQty + delta
        if (newQty <= 0) {
            dispatch(removeItemFromCart(productId))
            return
        }
        dispatch(updateItemQuantity({ productId, quantity: newQty }))
    }

    const handleRemove = (productId) => {
        dispatch(removeItemFromCart(productId))
    }

    return (
        <main className="min-h-screen bg-[#f9faf6] text-[#1a1c1a]">
            {/* Header */}
            <header className="fixed top-0 z-50 w-full border-b border-white/40 bg-[#f9faf6]/80 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(10,20,16,0.08)]">
                <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2"
                    >
                        <Sprout className="h-6 w-6 text-[#03271a]" />
                        <span className="text-xl font-bold tracking-tight text-[#03271a]">
                            RootNIX
                        </span>
                    </button>

                    <div className="relative">
                        <ShoppingCart
                            className="h-5 w-5 text-[#03271a]"
                            fill={totalItems > 0 ? "#03271a" : "none"}
                        />
                        {totalItems > 0 && (
                            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#502f09] text-[10px] font-bold text-[#c69667]">
                                {totalItems}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-lg px-4 pb-40 pt-24">
                <h1 className="mb-8 text-3xl font-bold tracking-tight text-[#03271a]">
                    Your Cart
                </h1>

                {status === "loading" && items.length === 0 ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-[#03271a]" />
                    </div>
                ) : isEmpty ? (
                    <div className="flex flex-col items-center py-20 text-center">
                        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-[#cbe6d4]">
                            <Sprout className="h-14 w-14 text-[#506859]" />
                        </div>
                        <p className="mb-8 font-medium text-[#414844]">
                            Your sanctuary is empty. Start your plant journey today.
                        </p>
                        <Button
                            onClick={() => navigate("/")}
                            className="rounded-full bg-[#03271a] px-8 py-6 text-sm font-bold tracking-widest text-white hover:bg-[#03271a]/90"
                        >
                            BROWSE PLANTS
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {items.map((item) => {
                                const product = item.productId
                                if (!product) return null
                                const image = product.images?.[0]?.url

                                return (
                                    <div
                                        key={product._id}
                                        className="flex items-center gap-4 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur-xl"
                                    >
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#edeeea]">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Sprout className="h-8 w-8 text-[#aacfbb]" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-grow">
                                            <div className="flex items-start justify-between">
                                                <h3 className="text-lg font-semibold leading-tight text-[#1a1c1a]">
                                                    {product.name}
                                                </h3>
                                                <button
                                                    onClick={() => handleRemove(product._id)}
                                                    disabled={mutating}
                                                    className="rounded-full p-1 text-[#ba1a1a] transition-colors hover:bg-[#ffdad6]/40 disabled:opacity-50"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>

                                            <div className="mt-3 flex items-end justify-between">
                                                <span className="text-lg font-bold text-[#03271a]">
                                                    ₹{product.price}
                                                </span>

                                                <div className="flex items-center gap-3 rounded-full bg-[#edeeea] px-2 py-1">
                                                    <button
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                product._id,
                                                                item.quantity,
                                                                -1
                                                            )
                                                        }
                                                        disabled={mutating}
                                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm active:scale-95 disabled:opacity-50"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="min-w-[1ch] text-center text-sm font-bold">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                product._id,
                                                                item.quantity,
                                                                1
                                                            )
                                                        }
                                                        disabled={
                                                            mutating || item.quantity >= product.stock
                                                        }
                                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#03271a] text-white shadow-sm active:scale-95 disabled:opacity-50"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-12 space-y-4 rounded-3xl border border-[#c1c8c2]/30 bg-[#f3f4f0] p-6">
                            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#03271a]">
                                Order Summary
                            </h4>
                            <div className="flex justify-between text-[#414844]">
                                <span>Subtotal</span>
                                <span className="font-medium text-[#1a1c1a]">
                                    ₹{totalAmount}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-[#c1c8c2]/20 pb-4 text-[#414844]">
                                <span>Shipping</span>
                                <span className="font-medium text-[#1a1c1a]">
                                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 text-[#1a1c1a]">
                                <span className="text-lg font-bold">Total</span>
                                <span className="text-2xl font-black text-[#03271a]">
                                    ₹{total}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-xl bg-[#cbe6d4]/30 p-3 text-sm text-[#506859]">
                                <Truck className="h-5 w-5" />
                                <span>Standard delivery in 2-3 business days</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Sticky CTA */}
            {!isEmpty && (
                <div className="fixed bottom-0 left-0 z-40 w-full border-t border-[#c1c8c2]/10 bg-[#f9faf6]/90 p-4 backdrop-blur-md">
                    <div className="mx-auto max-w-lg">
                        <Button
                            onClick={() => navigate("/checkout")}
                            disabled={mutating}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#03271a] py-6 font-bold uppercase tracking-widest text-white shadow-[0_12px_24px_-8px_rgba(3,39,26,0.3)] transition-all hover:scale-[1.02] hover:bg-[#03271a]/90 active:scale-[0.98]"
                        >
                            Proceed to Checkout
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </main>
    )
}

export default CartPage
