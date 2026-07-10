import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import toast from "react-hot-toast"
import {
    ArrowLeft,
    Droplets,
    Sprout,
    Sun,
    Layers,
    ShieldCheck,
    Heart,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext.jsx"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import { getProductById } from "@/services/productService"
import { addItemToCart, fetchCart } from "@/redux/cartSlice"

const ProductDetailPage = () => {
    const { productId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useAuth()
    const { mutating: cartMutating } = useSelector((state) => state.cart)

    const [product, setProduct] = useState(null)
    const [status, setStatus] = useState("loading")
    const [activeImage, setActiveImage] = useState(0)

    useEffect(() => {
        let cancelled = false
        setStatus("loading")
        getProductById(productId)
            .then((res) => {
                if (cancelled) return
                setProduct(res.data.data)
                setActiveImage(0)
                setStatus("succeeded")
            })
            .catch((err) => {
                if (cancelled) return
                setStatus("failed")
                toast.error(err.response?.data?.message || "Product not found")
            })
        return () => {
            cancelled = true
        }
    }, [productId])

    useEffect(() => {
        if (user) dispatch(fetchCart())
    }, [user, dispatch])

    const handleAddToCart = () => {
        if (!user) {
            toast.error("Please log in to add items to your cart")
            navigate("/login")
            return
        }
        dispatch(addItemToCart({ productId: product._id, quantity: 1 }))
            .unwrap()
            .then(() => toast.success(`${product.name} added to cart`))
            .catch((err) => toast.error(err || "Failed to add to cart"))
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f9faf6] text-[#1a1c1a]">
            <Navbar active="marketplace" />

            <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 md:px-16 md:pt-40">
                <button
                    onClick={() => navigate("/marketplace")}
                    className="mb-8 flex items-center gap-2 text-sm font-semibold text-[#414844] transition hover:text-[#03271a]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Marketplace
                </button>

                {status === "loading" && (
                    <div className="py-24 text-center text-[#414844]">Loading plant details...</div>
                )}

                {status === "failed" && (
                    <div className="py-24 text-center text-[#414844]">
                        We couldn&apos;t find this listing. It may have been removed.
                    </div>
                )}

                {status === "succeeded" && product && (
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                        {/* Images */}
                        <div>
                            <div className="mb-4 aspect-square overflow-hidden rounded-3xl bg-[#e2e3df] shadow-[0_24px_60px_-30px_rgba(10,20,16,0.25)]">
                                {product.images?.[activeImage]?.url && (
                                    <img
                                        src={product.images[activeImage].url}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                    />
                                )}
                            </div>
                            {product.images?.length > 1 && (
                                <div className="flex gap-3">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={img.publicId || idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`h-20 w-20 overflow-hidden rounded-2xl border-2 transition ${
                                                activeImage === idx
                                                    ? "border-[#03271a]"
                                                    : "border-transparent opacity-70 hover:opacity-100"
                                            }`}
                                        >
                                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div>
                            <span className="mb-4 inline-block rounded-full bg-[#cbe6d4] px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#344c3e]">
                                {product.category}
                            </span>

                            <div className="mb-4 flex items-start justify-between gap-4">
                                <h1 className="text-4xl font-bold text-[#03271a]">{product.name}</h1>
                                <button className="mt-2 text-[#414844] transition hover:text-[#03271a]">
                                    <Heart className="h-6 w-6" />
                                </button>
                            </div>

                            {product.seller?.fullName && (
                                <p className="mb-6 text-sm uppercase tracking-wide text-[#414844]">
                                    Verified Seller: {product.seller.fullName}
                                </p>
                            )}

                            <p className="mb-8 text-lg font-bold text-[#03271a]">₹{product.price}</p>

                            <p className="mb-8 leading-relaxed text-[#414844]">
                                {product.description || "The seller hasn't added a description for this plant yet."}
                            </p>

                            {/* Care details */}
                            <div className="mb-8 grid grid-cols-2 gap-4">
                                {product.careLevel && (
                                    <DetailPill icon={<Sprout className="h-4 w-4" />} label="Care Level" value={product.careLevel} />
                                )}
                                {product.lightRequirement && (
                                    <DetailPill icon={<Sun className="h-4 w-4" />} label="Light" value={product.lightRequirement} />
                                )}
                                {product.wateringFrequency && (
                                    <DetailPill icon={<Droplets className="h-4 w-4" />} label="Watering" value={product.wateringFrequency} />
                                )}
                                {product.soilType && (
                                    <DetailPill icon={<Layers className="h-4 w-4" />} label="Soil" value={product.soilType} />
                                )}
                            </div>

                            <div className="mb-8 flex items-center gap-2 text-sm text-[#414844]">
                                <ShieldCheck className="h-4 w-4 text-[#03271a]" />
                                {product.stock > 0 ? `${product.stock} in stock` : "Currently out of stock"}
                            </div>

                            <Button
                                onClick={handleAddToCart}
                                disabled={cartMutating || product.stock === 0}
                                className="w-full rounded-full bg-[#03271a] py-6 text-base font-semibold text-white hover:bg-[#03271a]/90 disabled:opacity-50 sm:w-auto sm:px-12"
                            >
                                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const DetailPill = ({ icon, label, value }) => (
    <div className="rounded-2xl border border-[#c1c8c2]/30 bg-white p-4">
        <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#414844]">
            {icon}
            {label}
        </div>
        <p className="font-semibold text-[#03271a]">{value}</p>
    </div>
)

export default ProductDetailPage
