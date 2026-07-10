import { useRef } from "react"
import { ChevronLeft, ChevronRight, Heart, Sprout, Sun, Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"

const ProductGlider = ({ products, onAddToCart, cartMutating }) => {
    const trackRef = useRef(null)

    const scrollByCard = (direction) => {
        const track = trackRef.current
        if (!track) return
        const card = track.querySelector("[data-glide-card]")
        const cardWidth = card ? card.offsetWidth + 24 : 320
        track.scrollBy({ left: direction * cardWidth, behavior: "smooth" })
    }

    return (
        <div className="relative">
            <div
                ref={trackRef}
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {products.map((plant) => (
                    <div
                        key={plant._id}
                        data-glide-card
                        className="group w-[280px] flex-none snap-start overflow-hidden rounded-3xl border border-[#c1c8c2]/20 bg-[#f9faf6] shadow-[0_24px_60px_-30px_rgba(10,20,16,0.25)] transition duration-500 hover:-translate-y-2 sm:w-[320px]"
                    >
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
                        </div>

                        <div className="p-6">
                            <div className="mb-3 flex items-start justify-between">
                                <div>
                                    <h4 className="text-xl font-bold text-[#03271a]">{plant.name}</h4>
                                    {plant.seller?.fullName && (
                                        <p className="text-xs uppercase tracking-wide text-[#414844]">
                                            Verified Seller: {plant.seller.fullName}
                                        </p>
                                    )}
                                </div>
                                <button className="text-[#414844] transition hover:text-[#03271a]">
                                    <Heart className="h-5 w-5" />
                                </button>
                            </div>

                            {plant.description && (
                                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#414844]">
                                    {plant.description}
                                </p>
                            )}

                            {(plant.careLevel || plant.lightRequirement) && (
                                <div className="mb-5 flex flex-wrap gap-2">
                                    {plant.careLevel && (
                                        <span className="flex items-center gap-1 rounded-full bg-[#f3f4f0] px-3 py-1 text-xs font-semibold text-[#03271a]">
                                            <Sprout className="h-3 w-3" />
                                            {plant.careLevel} Care
                                        </span>
                                    )}
                                    {plant.lightRequirement && (
                                        <span className="flex items-center gap-1 rounded-full bg-[#f3f4f0] px-3 py-1 text-xs font-semibold text-[#03271a]">
                                            <Sun className="h-3 w-3" />
                                            {plant.lightRequirement}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-[#03271a]">₹{plant.price}</span>
                                <Button
                                    onClick={() => onAddToCart(plant)}
                                    disabled={cartMutating || plant.stock === 0}
                                    className="rounded-xl bg-[#03271a] text-white hover:bg-[#03271a]/90 disabled:opacity-50"
                                >
                                    {plant.stock === 0 ? "Out of Stock" : "Add to Cart"}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length > 1 && (
                <div className="mt-2 flex justify-end gap-3">
                    <button
                        onClick={() => scrollByCard(-1)}
                        aria-label="Previous"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c1c8c2]/40 bg-white text-[#03271a] shadow-sm transition hover:bg-[#e7e9e5]"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => scrollByCard(1)}
                        aria-label="Next"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c1c8c2]/40 bg-white text-[#03271a] shadow-sm transition hover:bg-[#e7e9e5]"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    )
}

export default ProductGlider
