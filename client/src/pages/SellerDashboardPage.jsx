import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import {
    Sprout,
    Store,
    Loader2,
    LogOut,
    Pencil,
    X,
    Check,
    Plus,
    Trash2,
    Package,
    ShieldCheck,
    Clock,
    AlertTriangle,
    Ban,
    Star,
    Boxes,
    UserCircle,
} from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    createSellerProfile,
    getMySellerProfile,
    updateSellerProfile,
    deleteSellerProfile,
    getSellerDashboardStats,
} from "@/services/sellerService"
import {
    getMyListings,
    createProduct,
    updateProduct,
    deleteProduct,
} from "@/services/productService"

const CATEGORY_OPTIONS = [
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
const CARE_LEVEL_OPTIONS = ["Easy", "Medium", "Hard"]
const LIGHT_OPTIONS = ["Low Light", "Indirect Light", "Bright Light", "Full Sun"]
const WATERING_OPTIONS = ["Daily", "Twice a week", "Weekly", "Occasionally"]
const SOIL_OPTIONS = [
    "Well-draining Soil",
    "Loamy Soil",
    "Sandy Soil",
    "Clay Soil",
    "Cactus Mix",
    "Orchid Mix",
    "Peat-based Mix",
    "Compost-rich Soil",
    "Other",
]

const STATUS_META = {
    pending: {
        label: "Pending Review",
        badge: "bg-[#f3ecd8] text-[#8a6b1f]",
        icon: Clock,
        message:
            "Your seller profile is awaiting admin approval. You'll be able to list products once it's approved.",
    },
    approved: {
        label: "Approved",
        badge: "bg-[#cbe6d4] text-[#1b3d2f]",
        icon: ShieldCheck,
        message: null,
    },
    rejected: {
        label: "Rejected",
        badge: "bg-[#f3d9d5] text-[#8a2f22]",
        icon: AlertTriangle,
        message:
            "Your seller profile was rejected. Update your details and it will be reviewed again.",
    },
    suspended: {
        label: "Suspended",
        badge: "bg-[#e3e3e3] text-[#4a4a4a]",
        icon: Ban,
        message:
            "Your seller account is currently suspended. Contact support for more information.",
    },
}

const EMPTY_PROFILE_FORM = {
    shopName: "",
    shopDescription: "",
    businessEmail: "",
    businessPhone: "",
    city: "",
    pincode: "",
    address: "",
}

const EMPTY_PRODUCT_FORM = {
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    careLevel: "Easy",
    lightRequirement: "Indirect Light",
    wateringFrequency: "Weekly",
    soilType: "Well-draining Soil",
}

const inputClasses = "rounded-2xl bg-[#f3f4f0] py-6"
const textareaClasses =
    "w-full min-w-0 rounded-2xl border border-input bg-[#f3f4f0] px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const SellerDashboardPage = () => {
    const navigate = useNavigate()
    const { user, logoutUser, authLoading } = useAuth()

    const [loadingProfile, setLoadingProfile] = useState(true)
    const [sellerProfile, setSellerProfile] = useState(null)
    const [stats, setStats] = useState(null)

    const [editingProfile, setEditingProfile] = useState(false)
    const [savingProfile, setSavingProfile] = useState(false)
    const [deletingProfile, setDeletingProfile] = useState(false)
    const [profileForm, setProfileForm] = useState(EMPTY_PROFILE_FORM)

    const [listings, setListings] = useState([])
    const [listingsLoading, setListingsLoading] = useState(false)
    const [showAddProduct, setShowAddProduct] = useState(false)
    const [creatingProduct, setCreatingProduct] = useState(false)
    const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM)
    const [productImages, setProductImages] = useState([])
    const [deletingProductId, setDeletingProductId] = useState(null)

    const [editingProductId, setEditingProductId] = useState(null)
    const [editProductForm, setEditProductForm] = useState(EMPTY_PRODUCT_FORM)
    const [editProductImages, setEditProductImages] = useState([])
    const [savingProductEdit, setSavingProductEdit] = useState(false)

    const isApproved = sellerProfile?.status === "approved"

    // Redirect non-sellers back to their regular profile.
    useEffect(() => {
        if (!authLoading && user && user.role === "user") {
            navigate("/profile", { replace: true })
        }
    }, [authLoading, user, navigate])

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/login", { replace: true })
        }
    }, [authLoading, user, navigate])

    const loadProfile = async () => {
        try {
            setLoadingProfile(true)
            const res = await getMySellerProfile()
            const profile = res.data?.data || null
            setSellerProfile(profile)
            if (profile) {
                setProfileForm({
                    shopName: profile.shopName || "",
                    shopDescription: profile.shopDescription || "",
                    businessEmail: profile.businessEmail || "",
                    businessPhone: profile.businessPhone || "",
                    city: profile.city || "",
                    pincode: profile.pincode || "",
                    address: profile.address || "",
                })
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setSellerProfile(null)
            } else {
                toast.error(error.response?.data?.message || "Failed to load seller profile")
            }
        } finally {
            setLoadingProfile(false)
        }
    }

    useEffect(() => {
        if (user && (user.role === "seller" || user.role === "admin")) {
            loadProfile()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    useEffect(() => {
        const loadStatsAndListings = async () => {
            try {
                const statsRes = await getSellerDashboardStats()
                setStats(statsRes.data?.data || null)
            } catch (error) {
                // non-fatal — dashboard still usable without stats
            }

            if (sellerProfile?.status === "approved") {
                try {
                    setListingsLoading(true)
                    const listingsRes = await getMyListings()
                    setListings(listingsRes.data?.data || [])
                } catch (error) {
                    toast.error(error.response?.data?.message || "Failed to load listings")
                } finally {
                    setListingsLoading(false)
                }
            }
        }
        if (sellerProfile) loadStatsAndListings()
    }, [sellerProfile])

    const handleProfileChange = (e) => {
        setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleCreateProfile = async (e) => {
        e.preventDefault()
        try {
            setSavingProfile(true)
            const res = await createSellerProfile(profileForm)
            setSellerProfile(res.data?.data)
            toast.success(res.data?.message || "Seller profile created — awaiting approval")
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create seller profile")
        } finally {
            setSavingProfile(false)
        }
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        try {
            setSavingProfile(true)
            const res = await updateSellerProfile(profileForm)
            setSellerProfile(res.data?.data)
            toast.success(res.data?.message || "Seller profile updated")
            setEditingProfile(false)
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update seller profile")
        } finally {
            setSavingProfile(false)
        }
    }

    const handleCancelEdit = () => {
        if (sellerProfile) {
            setProfileForm({
                shopName: sellerProfile.shopName || "",
                shopDescription: sellerProfile.shopDescription || "",
                businessEmail: sellerProfile.businessEmail || "",
                businessPhone: sellerProfile.businessPhone || "",
                city: sellerProfile.city || "",
                pincode: sellerProfile.pincode || "",
                address: sellerProfile.address || "",
            })
        }
        setEditingProfile(false)
    }

    const handleDeleteProfile = async () => {
        if (!window.confirm("Delete your seller profile? This cannot be undone.")) return
        try {
            setDeletingProfile(true)
            await deleteSellerProfile()
            toast.success("Seller profile deleted")
            setSellerProfile(null)
            setStats(null)
            setListings([])
            setProfileForm(EMPTY_PROFILE_FORM)
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete seller profile")
        } finally {
            setDeletingProfile(false)
        }
    }

    const handleProductChange = (e) => {
        setProductForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleProductSelect = (field, value) => {
        setProductForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 5) {
            toast.error("You can upload a maximum of 5 images")
            setProductImages(files.slice(0, 5))
            return
        }
        setProductImages(files)
    }

    const handleCreateProduct = async (e) => {
        e.preventDefault()
        if (productImages.length === 0) {
            toast.error("Please add at least 1 product image")
            return
        }
        try {
            setCreatingProduct(true)
            const res = await createProduct(productForm, productImages)
            const newProduct = res.data?.data
            if (newProduct) setListings((prev) => [newProduct, ...prev])
            toast.success(res.data?.message || "Product created successfully")
            setProductForm(EMPTY_PRODUCT_FORM)
            setProductImages([])
            setShowAddProduct(false)
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create product")
        } finally {
            setCreatingProduct(false)
        }
    }

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Remove this listing? It will be marked unavailable.")) return
        try {
            setDeletingProductId(productId)
            await deleteProduct(productId)
            setListings((prev) =>
                prev.map((p) => (p._id === productId ? { ...p, isAvailable: false } : p))
            )
            toast.success("Listing removed")
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete listing")
        } finally {
            setDeletingProductId(null)
        }
    }

    const handleStartEditProduct = (product) => {
        setEditingProductId(product._id)
        setEditProductForm({
            name: product.name || "",
            description: product.description || "",
            price: product.price ?? "",
            category: product.category || "",
            stock: product.stock ?? "",
            careLevel: product.careLevel || "Easy",
            lightRequirement: product.lightRequirement || "Indirect Light",
            wateringFrequency: product.wateringFrequency || "Weekly",
            soilType: product.soilType || "Well-draining Soil",
        })
        setEditProductImages([])
        setShowAddProduct(false)
    }

    const handleCancelEditProduct = () => {
        setEditingProductId(null)
        setEditProductForm(EMPTY_PRODUCT_FORM)
        setEditProductImages([])
    }

    const handleEditProductChange = (e) => {
        setEditProductForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleEditProductSelect = (field, value) => {
        setEditProductForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleEditImagesChange = (e) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 5) {
            toast.error("You can upload a maximum of 5 images")
            setEditProductImages(files.slice(0, 5))
            return
        }
        setEditProductImages(files)
    }

    const handleSaveProductEdit = async (e, productId) => {
        e.preventDefault()
        try {
            setSavingProductEdit(true)
            const res = await updateProduct(productId, editProductForm, editProductImages)
            const updated = res.data?.data
            if (updated) {
                setListings((prev) => prev.map((p) => (p._id === productId ? updated : p)))
            }
            toast.success(res.data?.message || "Listing updated")
            handleCancelEditProduct()
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update listing")
        } finally {
            setSavingProductEdit(false)
        }
    }

    const handleRelistProduct = async (product) => {
        try {
            setSavingProductEdit(true)
            const res = await updateProduct(product._id, { isAvailable: true })
            const updated = res.data?.data
            setListings((prev) =>
                prev.map((p) => (p._id === product._id ? updated || { ...p, isAvailable: true } : p))
            )
            toast.success("Listing relisted")
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to relist product")
        } finally {
            setSavingProductEdit(false)
        }
    }

    const handleLogout = async () => {
        await logoutUser()
        navigate("/")
    }

    const statusMeta = useMemo(
        () => (sellerProfile ? STATUS_META[sellerProfile.status] || STATUS_META.pending : null),
        [sellerProfile]
    )

    if (authLoading || !user || loadingProfile) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f9faf6]">
                <Loader2 className="h-8 w-8 animate-spin text-[#03271a]" />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[#f9faf6] text-[#1a1c1a]">
            {/* Header */}
            <header className="fixed top-0 z-50 w-full border-b border-white/40 bg-[#f9faf6]/80 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(10,20,16,0.08)]">
                <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
                    <button onClick={() => navigate("/")} className="flex items-center gap-2">
                        <Sprout className="h-6 w-6 text-[#03271a]" />
                        <span className="text-xl font-bold tracking-tight text-[#03271a]">
                            RootNIX
                        </span>
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/seller-dashboard")}
                            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#414844] hover:text-[#03271a]"
                        >
                            <UserCircle className="h-4 w-4" />
                            Manage Account
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-28">
                {!sellerProfile ? (
                    /* ── No seller profile yet — creation form ─────────────── */
                    <section className="rounded-3xl border border-white/40 bg-white/60 p-6 shadow-[0_40px_80px_-15px_rgba(10,20,16,0.08)] backdrop-blur-xl sm:p-8">
                        <div className="mb-6 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#cbe6d4]">
                                <Store className="h-8 w-8 text-[#1b3d2f]" />
                            </div>
                            <h1 className="mb-2 text-2xl font-bold tracking-tight text-[#03271a]">
                                Set Up Your Seller Profile
                            </h1>
                            <p className="text-sm text-[#414844]">
                                Tell buyers about your shop. Once submitted, an admin will review
                                and approve your profile before you can list products.
                            </p>
                        </div>

                        <form onSubmit={handleCreateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="shopName">Shop Name</Label>
                                <Input
                                    id="shopName"
                                    name="shopName"
                                    value={profileForm.shopName}
                                    onChange={handleProfileChange}
                                    placeholder="e.g. Green Thumb Nursery"
                                    required
                                    className={inputClasses}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="shopDescription">Shop Description</Label>
                                <textarea
                                    id="shopDescription"
                                    name="shopDescription"
                                    value={profileForm.shopDescription}
                                    onChange={handleProfileChange}
                                    placeholder="What do you sell? What makes your shop special?"
                                    rows={3}
                                    maxLength={500}
                                    className={textareaClasses}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="businessEmail">Business Email</Label>
                                    <Input
                                        id="businessEmail"
                                        name="businessEmail"
                                        type="email"
                                        value={profileForm.businessEmail}
                                        onChange={handleProfileChange}
                                        required
                                        className={inputClasses}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="businessPhone">Business Phone</Label>
                                    <Input
                                        id="businessPhone"
                                        name="businessPhone"
                                        value={profileForm.businessPhone}
                                        onChange={handleProfileChange}
                                        required
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={profileForm.city}
                                        onChange={handleProfileChange}
                                        required
                                        className={inputClasses}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pincode">Pincode</Label>
                                    <Input
                                        id="pincode"
                                        name="pincode"
                                        value={profileForm.pincode}
                                        onChange={handleProfileChange}
                                        required
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Shop Address</Label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={profileForm.address}
                                    onChange={handleProfileChange}
                                    placeholder="Full pickup / business address"
                                    rows={2}
                                    required
                                    className={textareaClasses}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={savingProfile}
                                className="w-full rounded-2xl bg-[#03271a] py-6 text-base font-bold text-white hover:bg-[#03271a]/90"
                            >
                                {savingProfile ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Submit Seller Profile"
                                )}
                            </Button>
                        </form>
                    </section>
                ) : (
                    /* ── Seller profile exists ──────────────────────────────── */
                    <>
                        {/* Identity + status card */}
                        <section className="mb-6 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-[0_40px_80px_-15px_rgba(10,20,16,0.08)] backdrop-blur-xl">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#cbe6d4]">
                                        {sellerProfile.logo?.url ? (
                                            <img
                                                src={sellerProfile.logo.url}
                                                alt={sellerProfile.shopName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Store className="h-7 w-7 text-[#1b3d2f]" />
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold tracking-tight text-[#03271a]">
                                            {sellerProfile.shopName}
                                        </h1>
                                        <p className="text-xs text-[#727974]">
                                            {sellerProfile.city}, {sellerProfile.pincode}
                                        </p>
                                    </div>
                                </div>
                                {!editingProfile && (
                                    <button
                                        type="button"
                                        onClick={() => setEditingProfile(true)}
                                        className="flex flex-shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#03271a] hover:underline"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                )}
                            </div>

                            <div className="mb-5 flex flex-wrap items-center gap-2">
                                <span
                                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusMeta.badge}`}
                                >
                                    <statusMeta.icon className="h-3 w-3" />
                                    {statusMeta.label}
                                </span>
                                {sellerProfile.isVerifiedSeller && (
                                    <span className="flex items-center gap-1 rounded-full bg-[#dbe9f2] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#2c5a78]">
                                        <ShieldCheck className="h-3 w-3" />
                                        Verified
                                    </span>
                                )}
                            </div>

                            {statusMeta.message && (
                                <div className="mb-5 rounded-2xl bg-[#1b3d2f]/5 p-4 text-sm text-[#414844]">
                                    {statusMeta.message}
                                </div>
                            )}

                            {editingProfile ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-shopName">Shop Name</Label>
                                        <Input
                                            id="edit-shopName"
                                            name="shopName"
                                            value={profileForm.shopName}
                                            onChange={handleProfileChange}
                                            required
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-shopDescription">Description</Label>
                                        <textarea
                                            id="edit-shopDescription"
                                            name="shopDescription"
                                            value={profileForm.shopDescription}
                                            onChange={handleProfileChange}
                                            rows={3}
                                            maxLength={500}
                                            className={textareaClasses}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-businessEmail">Business Email</Label>
                                            <Input
                                                id="edit-businessEmail"
                                                name="businessEmail"
                                                type="email"
                                                value={profileForm.businessEmail}
                                                onChange={handleProfileChange}
                                                required
                                                className={inputClasses}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-businessPhone">Business Phone</Label>
                                            <Input
                                                id="edit-businessPhone"
                                                name="businessPhone"
                                                value={profileForm.businessPhone}
                                                onChange={handleProfileChange}
                                                required
                                                className={inputClasses}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-city">City</Label>
                                            <Input
                                                id="edit-city"
                                                name="city"
                                                value={profileForm.city}
                                                onChange={handleProfileChange}
                                                required
                                                className={inputClasses}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-pincode">Pincode</Label>
                                            <Input
                                                id="edit-pincode"
                                                name="pincode"
                                                value={profileForm.pincode}
                                                onChange={handleProfileChange}
                                                required
                                                className={inputClasses}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-address">Shop Address</Label>
                                        <textarea
                                            id="edit-address"
                                            name="address"
                                            value={profileForm.address}
                                            onChange={handleProfileChange}
                                            rows={2}
                                            required
                                            className={textareaClasses}
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleCancelEdit}
                                            disabled={savingProfile}
                                            className="flex-1 rounded-2xl py-6 font-bold text-[#414844]"
                                        >
                                            <X className="mr-1.5 h-4 w-4" />
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={savingProfile}
                                            className="flex-1 rounded-2xl bg-[#03271a] py-6 font-bold text-white hover:bg-[#03271a]/90"
                                        >
                                            {savingProfile ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Check className="mr-1.5 h-4 w-4" />
                                                    Save
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-3 text-sm">
                                    {sellerProfile.shopDescription && (
                                        <p className="border-b border-[#c1c8c2]/30 pb-3 text-[#414844]">
                                            {sellerProfile.shopDescription}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between border-b border-[#c1c8c2]/30 pb-3">
                                        <span className="text-[#727974]">Business Email</span>
                                        <span className="font-semibold text-[#1a1c1a]">
                                            {sellerProfile.businessEmail}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-[#c1c8c2]/30 pb-3">
                                        <span className="text-[#727974]">Business Phone</span>
                                        <span className="font-semibold text-[#1a1c1a]">
                                            {sellerProfile.businessPhone}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#727974]">Address</span>
                                        <span className="text-right font-semibold text-[#1a1c1a]">
                                            {sellerProfile.address}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Stats */}
                        {stats && (
                            <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    { label: "Products", value: stats.totalProducts, icon: Boxes },
                                    { label: "Active", value: stats.activeProducts, icon: Package },
                                    {
                                        label: "Out of Stock",
                                        value: stats.outOfStockProducts,
                                        icon: AlertTriangle,
                                    },
                                    {
                                        label: "Avg Rating",
                                        value: stats.averageRating
                                            ? stats.averageRating.toFixed(1)
                                            : "—",
                                        icon: Star,
                                    },
                                ].map(({ label, value, icon: Icon }) => (
                                    <div
                                        key={label}
                                        className="rounded-2xl border border-white/80 bg-white/60 p-4 text-center shadow-sm"
                                    >
                                        <Icon className="mx-auto mb-1.5 h-4 w-4 text-[#84a895]" />
                                        <p className="text-lg font-bold text-[#03271a]">{value ?? 0}</p>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#727974]">
                                            {label}
                                        </p>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Product management — approved sellers only */}
                        {isApproved && (
                            <section className="mb-6">
                                <div className="mb-4 flex items-center justify-between px-1">
                                    <h2 className="font-bold text-[#03271a]">My Listings</h2>
                                    <Button
                                        onClick={() => {
                                            setShowAddProduct((prev) => !prev)
                                            setEditingProductId(null)
                                        }}
                                        size="sm"
                                        className="rounded-full bg-[#03271a] px-4 text-white hover:bg-[#03271a]/90"
                                    >
                                        {showAddProduct ? (
                                            <>
                                                <X className="mr-1 h-3.5 w-3.5" />
                                                Close
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="mr-1 h-3.5 w-3.5" />
                                                Add Product
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {showAddProduct && (
                                    <form
                                        onSubmit={handleCreateProduct}
                                        className="mb-4 space-y-4 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="p-name">Product Name</Label>
                                            <Input
                                                id="p-name"
                                                name="name"
                                                value={productForm.name}
                                                onChange={handleProductChange}
                                                required
                                                className={inputClasses}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="p-description">Description</Label>
                                            <textarea
                                                id="p-description"
                                                name="description"
                                                value={productForm.description}
                                                onChange={handleProductChange}
                                                rows={3}
                                                required
                                                className={textareaClasses}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="p-price">Price (₹)</Label>
                                                <Input
                                                    id="p-price"
                                                    name="price"
                                                    type="number"
                                                    min="0"
                                                    value={productForm.price}
                                                    onChange={handleProductChange}
                                                    required
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="p-stock">Stock</Label>
                                                <Input
                                                    id="p-stock"
                                                    name="stock"
                                                    type="number"
                                                    min="0"
                                                    value={productForm.stock}
                                                    onChange={handleProductChange}
                                                    required
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select
                                                value={productForm.category}
                                                onValueChange={(v) => handleProductSelect("category", v)}
                                            >
                                                <SelectTrigger className="h-12 w-full rounded-2xl bg-[#f3f4f0] px-3.5">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CATEGORY_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt} value={opt}>
                                                            {opt}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Care Level</Label>
                                                <Select
                                                    value={productForm.careLevel}
                                                    onValueChange={(v) => handleProductSelect("careLevel", v)}
                                                >
                                                    <SelectTrigger className="h-12 w-full rounded-2xl bg-[#f3f4f0] px-3.5">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CARE_LEVEL_OPTIONS.map((opt) => (
                                                            <SelectItem key={opt} value={opt}>
                                                                {opt}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Light Requirement</Label>
                                                <Select
                                                    value={productForm.lightRequirement}
                                                    onValueChange={(v) =>
                                                        handleProductSelect("lightRequirement", v)
                                                    }
                                                >
                                                    <SelectTrigger className="h-12 w-full rounded-2xl bg-[#f3f4f0] px-3.5">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {LIGHT_OPTIONS.map((opt) => (
                                                            <SelectItem key={opt} value={opt}>
                                                                {opt}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Watering Frequency</Label>
                                                <Select
                                                    value={productForm.wateringFrequency}
                                                    onValueChange={(v) =>
                                                        handleProductSelect("wateringFrequency", v)
                                                    }
                                                >
                                                    <SelectTrigger className="h-12 w-full rounded-2xl bg-[#f3f4f0] px-3.5">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {WATERING_OPTIONS.map((opt) => (
                                                            <SelectItem key={opt} value={opt}>
                                                                {opt}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Soil Type</Label>
                                                <Select
                                                    value={productForm.soilType}
                                                    onValueChange={(v) => handleProductSelect("soilType", v)}
                                                >
                                                    <SelectTrigger className="h-12 w-full rounded-2xl bg-[#f3f4f0] px-3.5">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {SOIL_OPTIONS.map((opt) => (
                                                            <SelectItem key={opt} value={opt}>
                                                                {opt}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="p-images">
                                                Product Images (1-5)
                                            </Label>
                                            <input
                                                id="p-images"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImagesChange}
                                                className="block w-full rounded-2xl border border-input bg-[#f3f4f0] px-3.5 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#03271a] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                                            />
                                            {productImages.length > 0 && (
                                                <p className="text-xs text-[#727974]">
                                                    {productImages.length} image
                                                    {productImages.length === 1 ? "" : "s"} selected
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={creatingProduct}
                                            className="w-full rounded-2xl bg-[#03271a] py-6 font-bold text-white hover:bg-[#03271a]/90"
                                        >
                                            {creatingProduct ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                "Create Listing"
                                            )}
                                        </Button>
                                    </form>
                                )}

                                {listingsLoading ? (
                                    <div className="flex justify-center py-10">
                                        <Loader2 className="h-6 w-6 animate-spin text-[#03271a]" />
                                    </div>
                                ) : listings.length === 0 ? (
                                    <div className="rounded-3xl border border-white/40 bg-white/60 p-8 text-center shadow-sm backdrop-blur-xl">
                                        <Package className="mx-auto mb-3 h-8 w-8 text-[#84a895]" />
                                        <p className="text-sm text-[#414844]">
                                            You haven't listed any products yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {listings.map((product) =>
                                            editingProductId === product._id ? (
                                                <form
                                                    key={product._id}
                                                    onSubmit={(e) => handleSaveProductEdit(e, product._id)}
                                                    className="space-y-4 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl"
                                                >
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`e-name-${product._id}`}>
                                                            Product Name
                                                        </Label>
                                                        <Input
                                                            id={`e-name-${product._id}`}
                                                            name="name"
                                                            value={editProductForm.name}
                                                            onChange={handleEditProductChange}
                                                            required
                                                            className={inputClasses}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor={`e-description-${product._id}`}>
                                                            Description
                                                        </Label>
                                                        <textarea
                                                            id={`e-description-${product._id}`}
                                                            name="description"
                                                            value={editProductForm.description}
                                                            onChange={handleEditProductChange}
                                                            rows={3}
                                                            required
                                                            className={textareaClasses}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`e-price-${product._id}`}>
                                                                Price (₹)
                                                            </Label>
                                                            <Input
                                                                id={`e-price-${product._id}`}
                                                                name="price"
                                                                type="number"
                                                                min="0"
                                                                value={editProductForm.price}
                                                                onChange={handleEditProductChange}
                                                                required
                                                                className={inputClasses}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`e-stock-${product._id}`}>
                                                                Stock
                                                            </Label>
                                                            <Input
                                                                id={`e-stock-${product._id}`}
                                                                name="stock"
                                                                type="number"
                                                                min="0"
                                                                value={editProductForm.stock}
                                                                onChange={handleEditProductChange}
                                                                required
                                                                className={inputClasses}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Category</Label>
                                                        <Select
                                                            value={editProductForm.category}
                                                            onValueChange={(v) =>
                                                                handleEditProductSelect("category", v)
                                                            }
                                                        >
                                                            <SelectTrigger className="h-12 w-full rounded-2xl bg-[#f3f4f0] px-3.5">
                                                                <SelectValue placeholder="Select category" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {CATEGORY_OPTIONS.map((opt) => (
                                                                    <SelectItem key={opt} value={opt}>
                                                                        {opt}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label>Care Level</Label>
                                                            <Select
                                                                value={editProductForm.careLevel}
                                                                onValueChange={(v) =>
                                                                    handleEditProductSelect("careLevel", v)
                                                                }
                                                            >
                                                                <SelectTrigger className="h-12 w-full rounded-2xl bg-[#f3f4f0] px-3.5">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {CARE_LEVEL_OPTIONS.map((opt) => (
                                                                        <SelectItem key={opt} value={opt}>
                                                                            {opt}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Light Requirement</Label>
                                                            <Select
                                                                value={editProductForm.lightRequirement}
                                                                onValueChange={(v) =>
                                                                    handleEditProductSelect(
                                                                        "lightRequirement",
                                                                        v
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="h-12 w-full rounded-2xl bg-[#f3f4f0] px-3.5">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {LIGHT_OPTIONS.map((opt) => (
                                                                        <SelectItem key={opt} value={opt}>
                                                                            {opt}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label>Watering Frequency</Label>
                                                            <Select
                                                                value={editProductForm.wateringFrequency}
                                                                onValueChange={(v) =>
                                                                    handleEditProductSelect(
                                                                        "wateringFrequency",
                                                                        v
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="h-12 w-full rounded-2xl bg-[#f3f4f0] px-3.5">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {WATERING_OPTIONS.map((opt) => (
                                                                        <SelectItem key={opt} value={opt}>
                                                                            {opt}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Soil Type</Label>
                                                            <Select
                                                                value={editProductForm.soilType}
                                                                onValueChange={(v) =>
                                                                    handleEditProductSelect("soilType", v)
                                                                }
                                                            >
                                                                <SelectTrigger className="h-12 w-full rounded-2xl bg-[#f3f4f0] px-3.5">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {SOIL_OPTIONS.map((opt) => (
                                                                        <SelectItem key={opt} value={opt}>
                                                                            {opt}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor={`e-images-${product._id}`}>
                                                            Replace Images (optional, 1-5)
                                                        </Label>
                                                        <input
                                                            id={`e-images-${product._id}`}
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={handleEditImagesChange}
                                                            className="block w-full rounded-2xl border border-input bg-[#f3f4f0] px-3.5 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#03271a] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                                                        />
                                                        <p className="text-xs text-[#727974]">
                                                            {editProductImages.length > 0
                                                                ? `${editProductImages.length} new image${
                                                                      editProductImages.length === 1 ? "" : "s"
                                                                  } will replace the current photos`
                                                                : "Leave empty to keep existing photos"}
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-3 pt-2">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={handleCancelEditProduct}
                                                            disabled={savingProductEdit}
                                                            className="flex-1 rounded-2xl py-6 font-bold text-[#414844]"
                                                        >
                                                            <X className="mr-1.5 h-4 w-4" />
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            disabled={savingProductEdit}
                                                            className="flex-1 rounded-2xl bg-[#03271a] py-6 font-bold text-white hover:bg-[#03271a]/90"
                                                        >
                                                            {savingProductEdit ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Check className="mr-1.5 h-4 w-4" />
                                                                    Save Changes
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div
                                                    key={product._id}
                                                    className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white/60 p-3 shadow-sm"
                                                >
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
                                                        <p className="font-bold text-[#1a1c1a]">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-[#727974]">
                                                            {product.category} · Stock: {product.stock}
                                                        </p>
                                                        <span
                                                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                                                                product.isAvailable
                                                                    ? "bg-[#cbe6d4] text-[#1b3d2f]"
                                                                    : "bg-[#e3e3e3] text-[#4a4a4a]"
                                                            }`}
                                                        >
                                                            {product.isAvailable ? "Live" : "Delisted"}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <p className="font-bold text-[#03271a]">
                                                            ₹{product.price}
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => handleStartEditProduct(product)}
                                                                className="text-[#414844] transition hover:text-[#03271a]"
                                                                title="Edit listing"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            {product.isAvailable ? (
                                                                <button
                                                                    onClick={() =>
                                                                        handleDeleteProduct(product._id)
                                                                    }
                                                                    disabled={deletingProductId === product._id}
                                                                    className="text-[#8a2f22] transition hover:text-[#6e2419] disabled:opacity-50"
                                                                    title="Delist product"
                                                                >
                                                                    {deletingProductId === product._id ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleRelistProduct(product)}
                                                                    disabled={savingProductEdit}
                                                                    className="text-xs font-bold uppercase tracking-widest text-[#1b3d2f] hover:underline disabled:opacity-50"
                                                                >
                                                                    Relist
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Danger zone */}
                        {stats?.totalProducts === 0 && (
                            <section className="mb-6">
                                <Button
                                    onClick={handleDeleteProfile}
                                    disabled={deletingProfile}
                                    variant="ghost"
                                    className="w-full rounded-2xl py-6 font-bold text-[#8a2f22] hover:bg-[#f3d9d5]/50 hover:text-[#8a2f22]"
                                >
                                    {deletingProfile ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Seller Profile
                                        </>
                                    )}
                                </Button>
                            </section>
                        )}
                    </>
                )}

                {/* Logout */}
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full rounded-2xl py-6 font-bold text-[#414844] hover:bg-[#e7e9e5]/60"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </Button>
            </div>
        </main>
    )
}

export default SellerDashboardPage
