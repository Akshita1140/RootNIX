import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Heart, Sprout, Sun, Droplets, ArrowRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

const FlipProductCard = ({ plant, onAddToCart, cartMutating }) => {
    const navigate = useNavigate()
    const [flipped, setFlipped] = useState(false)

    const stop = (e) => e.stopPropagation()

    return (
        <div
            className="group [perspective:1200px]"
            onClick={() => setFlipped((f) => !f)}
        >
            <div
                className="relative h-[420px] w-full cursor-pointer transition-transform duration-700 [transform-style:preserve-3d]"
                style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
            >
                {/* FRONT */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl border border-[#c1c8c2]/20 bg-white shadow-[0_24px_60px_-30px_rgba(10,20,16,0.25)] [backface-visibility:hidden]">
                    <div className="relative h-64 overflow-hidden bg-[#e2e3df]">
                        {plant.images?.[0]?.url && (
                            <img
                                src={plant.images[0].url}
                                alt={plant.name}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                            />
                        )}
                        <span className="absolute right-4 top-4 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-[#03271a] backdrop-blur-xl">
                            {plant.category}
                        </span>
                        <span className="absolute bottom-4 left-4 rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                            Tap for details
                        </span>
                    </div>

                    <div className="p-6">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h4 className="text-xl font-bold text-[#03271a]">{plant.name}</h4>
                                {plant.seller?.fullName && (
                                    <p className="text-xs uppercase tracking-wide text-[#414844]">
                                        Verified Seller: {plant.seller.fullName}
                                    </p>
                                )}
                            </div>
                            <button onClick={stop} className="text-[#414844] transition hover:text-[#03271a]">
                                <Heart className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-[#03271a]">₹{plant.price}</span>
                            <Button
                                onClick={(e) => {
                                    stop(e)
                                    onAddToCart(plant)
                                }}
                                disabled={cartMutating || plant.stock === 0}
                                className="rounded-xl bg-[#03271a] text-white hover:bg-[#03271a]/90 disabled:opacity-50"
                            >
                                {plant.stock === 0 ? "Out of Stock" : "Add to Cart"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* BACK */}
                <div
                    className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl border border-[#c1c8c2]/20 bg-[#03271a] p-6 text-white shadow-[0_24px_60px_-30px_rgba(10,20,16,0.25)] [backface-visibility:hidden]"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <div className="mb-4 flex items-start justify-between">
                        <h4 className="text-xl font-bold">{plant.name}</h4>
                        <button onClick={stop} className="text-[#aacfbb] hover:text-white">
                            <RotateCcw className="h-5 w-5" />
                        </button>
                    </div>

                    <p className="mb-5 flex-1 overflow-hidden text-sm leading-relaxed text-[#cee9d6]">
                        {plant.description || "No description added by the seller yet."}
                    </p>

                    <div className="mb-5 flex flex-wrap gap-2">
                        {plant.careLevel && (
                            <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                                <Sprout className="h-3 w-3" />
                                {plant.careLevel} Care
                            </span>
                        )}
                        {plant.lightRequirement && (
                            <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                                <Sun className="h-3 w-3" />
                                {plant.lightRequirement}
                            </span>
                        )}
                        {plant.wateringFrequency && (
                            <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                                <Droplets className="h-3 w-3" />
                                {plant.wateringFrequency}
                            </span>
                        )}
                    </div>

                    <Button
                        onClick={(e) => {
                            stop(e)
                            navigate(`/product/${plant._id}`)
                        }}
                        className="w-full rounded-xl bg-[#c5ebd7] text-[#002115] hover:bg-[#aacfbb]"
                    >
                        Full Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default FlipProductCard
