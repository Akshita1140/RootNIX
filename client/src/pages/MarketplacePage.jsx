import { useEffect, useMemo, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext.jsx"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import FlipProductCard from "@/components/FlipProductCard"
import { getProducts } from "@/services/productService"
import { addItemToCart, fetchCart } from "@/redux/cartSlice"

const CATEGORIES = [
    "Indoor Plants",
    "Outdoor Plants",
    "Rare Plants",
    "Medicinal Plants",
    "Succulents",
    "Seeds",
    "Tools",
    "Fertilizers",
    "Pots",
    "Other",
]

const CARE_LEVELS = ["Easy", "Medium", "Hard"]

const SORT_OPTIONS = [
    { value: "newest", label: "Newest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
]

const PAGE_LIMIT = 12

const MarketplacePage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useAuth()
    const { mutating: cartMutating } = useSelector((state) => state.cart)
    const [searchParams] = useSearchParams()

    const [products, setProducts] = useState([])
    const [pagination, setPagination] = useState(null)
    const [status, setStatus] = useState("idle")
    const [filtersOpen, setFiltersOpen] = useState(false)

    const [search, setSearch] = useState(searchParams.get("search") || "")
    const [category, setCategory] = useState("")
    const [careLevel, setCareLevel] = useState("")
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")
    const [sortBy, setSortBy] = useState("newest")
    const [page, setPage] = useState(1)

    const [appliedSearch, setAppliedSearch] = useState(search)

    // debounce: apply search 400ms after typing stops, so results update live
    useEffect(() => {
        const timer = setTimeout(() => {
            setAppliedSearch(search)
            setPage(1)
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    const loadProducts = useCallback(async () => {
        setStatus("loading")
        try {
            const params = {
                page,
                limit: PAGE_LIMIT,
                sortBy,
            }
            if (appliedSearch) params.search = appliedSearch
            if (category) params.category = category
            if (careLevel) params.careLevel = careLevel
            if (minPrice) params.minPrice = minPrice
            if (maxPrice) params.maxPrice = maxPrice

            const res = await getProducts(params)
            const { products: items, pagination: pageInfo } = res.data.data
            setProducts(items)
            setPagination(pageInfo)
            setStatus("succeeded")
        } catch (err) {
            setStatus("failed")
            toast.error(err.response?.data?.message || "Failed to load marketplace")
        }
    }, [page, sortBy, appliedSearch, category, careLevel, minPrice, maxPrice])

    useEffect(() => {
        loadProducts()
    }, [loadProducts])

    useEffect(() => {
        if (user) dispatch(fetchCart())
    }, [user, dispatch])

    const handleSearchSubmit = () => {
        setPage(1)
        setAppliedSearch(search)
    }

    const handleAddToCart = (product) => {
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

    const resetFilters = () => {
        setCategory("")
        setCareLevel("")
        setMinPrice("")
        setMaxPrice("")
        setSortBy("newest")
        setSearch("")
        setAppliedSearch("")
        setPage(1)
    }

    const activeFilterCount = useMemo(
        () => [category, careLevel, minPrice, maxPrice].filter(Boolean).length,
        [category, careLevel, minPrice, maxPrice]
    )

    const filterPanelProps = {
        category,
        setCategory,
        careLevel,
        setCareLevel,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        setPage,
        activeFilterCount,
        resetFilters,
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f9faf6] text-[#1a1c1a]">
            <Navbar
                active="marketplace"
                searchValue={search}
                onSearchChange={setSearch}
                onSearchSubmit={handleSearchSubmit}
            />

            <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-16 md:pt-40">
                <div className="mb-10">
                    <h1 className="mb-3 text-4xl font-bold text-[#03271a] md:text-5xl">
                        Marketplace
                    </h1>
                    <p className="max-w-2xl text-[#414844]">
                        Browse every listing from verified sellers — filter by category, care
                        level, and price to find your next plant.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
                    {/* Desktop filter sidebar */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-28 rounded-3xl border border-[#c1c8c2]/30 bg-white p-6 shadow-sm">
                            <FilterPanel {...filterPanelProps} />
                        </div>
                    </aside>

                    <div>
                        {/* Toolbar */}
                        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                            <button
                                onClick={() => setFiltersOpen(true)}
                                className="flex items-center gap-2 rounded-full border border-[#c1c8c2]/40 bg-white px-4 py-2 text-sm font-semibold text-[#03271a] shadow-sm lg:hidden"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#03271a] text-[10px] font-bold text-white">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>

                            <p className="text-sm text-[#414844]">
                                {pagination ? `${pagination.total} listings found` : ""}
                            </p>

                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value)
                                    setPage(1)
                                }}
                                className="rounded-full border border-[#c1c8c2]/40 bg-white px-4 py-2 text-sm font-semibold text-[#03271a] outline-none"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        Sort: {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Product grid */}
                        {status === "loading" ? (
                            <div className="py-24 text-center text-[#414844]">
                                Loading listings...
                            </div>
                        ) : products.length === 0 ? (
                            <div className="py-24 text-center text-[#414844]">
                                No plants match these filters. Try widening your search.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {products.map((plant) => (
                                    <FlipProductCard
                                        key={plant._id}
                                        plant={plant}
                                        onAddToCart={handleAddToCart}
                                        cartMutating={cartMutating}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-4">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c1c8c2]/40 bg-white text-[#03271a] shadow-sm transition hover:bg-[#e7e9e5] disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="text-sm font-semibold text-[#414844]">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button
                                    disabled={page >= pagination.totalPages}
                                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c1c8c2]/40 bg-white text-[#03271a] shadow-sm transition hover:bg-[#e7e9e5] disabled:opacity-40"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile filter drawer */}
            {filtersOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setFiltersOpen(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[#03271a]">Filters</h3>
                            <button onClick={() => setFiltersOpen(false)}>
                                <X className="h-5 w-5 text-[#414844]" />
                            </button>
                        </div>
                        <FilterPanel {...filterPanelProps} />
                        <Button
                            onClick={() => setFiltersOpen(false)}
                            className="mt-8 w-full rounded-full bg-[#03271a] py-6 text-white hover:bg-[#03271a]/90"
                        >
                            Show {pagination?.total ?? ""} Results
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

const FilterPanel = ({
    category,
    setCategory,
    careLevel,
    setCareLevel,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    setPage,
    activeFilterCount,
    resetFilters,
}) => (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#03271a]">Filters</h3>
            {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="text-xs font-semibold text-[#502f09] hover:underline">
                    Clear all
                </button>
            )}
        </div>

        <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#414844]">
                Category
            </p>
            <div className="space-y-2">
                {CATEGORIES.map((c) => (
                    <label key={c} className="flex cursor-pointer items-center gap-2 text-sm text-[#1a1c1a]">
                        <input
                            type="radio"
                            name="category"
                            checked={category === c}
                            onChange={() => {
                                setCategory(category === c ? "" : c)
                                setPage(1)
                            }}
                            className="h-4 w-4 accent-[#03271a]"
                        />
                        {c}
                    </label>
                ))}
            </div>
        </div>

        <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#414844]">
                Care Level
            </p>
            <div className="flex flex-wrap gap-2">
                {CARE_LEVELS.map((lvl) => (
                    <button
                        key={lvl}
                        onClick={() => {
                            setCareLevel(careLevel === lvl ? "" : lvl)
                            setPage(1)
                        }}
                        className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                            careLevel === lvl
                                ? "border-[#03271a] bg-[#03271a] text-white"
                                : "border-[#c1c8c2]/40 bg-white text-[#414844] hover:bg-[#e7e9e5]"
                        }`}
                    >
                        {lvl}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#414844]">
                Price Range (₹)
            </p>
            <div className="flex items-center gap-3">
                <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => {
                        setMinPrice(e.target.value)
                        setPage(1)
                    }}
                    placeholder="Min"
                    className="w-full rounded-xl border border-[#c1c8c2]/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#03271a]"
                />
                <span className="text-[#414844]">–</span>
                <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => {
                        setMaxPrice(e.target.value)
                        setPage(1)
                    }}
                    placeholder="Max"
                    className="w-full rounded-xl border border-[#c1c8c2]/40 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#03271a]"
                />
            </div>
        </div>
    </div>
)

export default MarketplacePage
