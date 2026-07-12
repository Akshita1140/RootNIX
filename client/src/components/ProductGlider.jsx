import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import FlipProductCard from "@/components/FlipProductCard"

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
                        className="w-[280px] flex-none snap-start sm:w-[320px]"
                    >
                        <FlipProductCard
                            plant={plant}
                            onAddToCart={onAddToCart}
                            cartMutating={cartMutating}
                        />
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
