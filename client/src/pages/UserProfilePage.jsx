import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import {
    Sprout,
    Camera,
    Loader2,
    LogOut,
    Pencil,
    X,
    Check,
    MapPin,
    Mail,
    ShieldCheck,
    ShieldAlert,
    Package,
} from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile, updateAvatar } from "@/services/userService"
import { getMyOrders } from "@/services/orderService"

const ORDER_STATUS_STYLES = {
    pending: "bg-[#f3ecd8] text-[#8a6b1f]",
    confirmed: "bg-[#dbe9f2] text-[#2c5a78]",
    shipped: "bg-[#e2ddf5] text-[#5a4b8a]",
    delivered: "bg-[#cbe6d4] text-[#1b3d2f]",
    cancelled: "bg-[#f3d9d5] text-[#8a2f22]",
}

const UserProfilePage = () => {
    const navigate = useNavigate()
    const { user, setUser, logoutUser, authLoading } = useAuth()
    const fileInputRef = useRef(null)

    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [avatarUploading, setAvatarUploading] = useState(false)
    const [orders, setOrders] = useState([])
    const [ordersLoading, setOrdersLoading] = useState(true)

    const [formData, setFormData] = useState({
        name: "",
        city: "",
        pincode: "",
    })

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/login", { replace: true })
        }
    }, [authLoading, user, navigate])

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                city: user.city || "",
                pincode: user.pincode || "",
            })
        }
    }, [user])

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setOrdersLoading(true)
                const res = await getMyOrders()
                const list = res.data?.data || []
                setOrders(list)
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to load orders")
            } finally {
                setOrdersLoading(false)
            }
        }
        if (user) loadOrders()
    }, [user])

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleCancelEdit = () => {
        setFormData({
            name: user?.name || "",
            city: user?.city || "",
            pincode: user?.pincode || "",
        })
        setEditing(false)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        try {
            setSaving(true)
            const res = await updateProfile(formData)
            const updatedUser = res.data?.data
            if (updatedUser) {
                setUser(updatedUser)
                localStorage.setItem("user", JSON.stringify(updatedUser))
            }
            toast.success(res.data?.message || "Profile updated")
            setEditing(false)
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setAvatarUploading(true)
            const res = await updateAvatar(file)
            const updatedUser = res.data?.data
            if (updatedUser) {
                setUser(updatedUser)
                localStorage.setItem("user", JSON.stringify(updatedUser))
            }
            toast.success(res.data?.message || "Avatar updated")
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update avatar")
        } finally {
            setAvatarUploading(false)
            e.target.value = ""
        }
    }

    const handleLogout = async () => {
        await logoutUser()
        navigate("/")
    }

    if (authLoading || !user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f9faf6]">
                <Loader2 className="h-8 w-8 animate-spin text-[#03271a]" />
            </main>
        )
    }

    const initial = (user.name || "?").trim().charAt(0).toUpperCase()

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
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#727974]">
                        My Profile
                    </span>
                </div>
            </header>

            <div className="mx-auto w-full max-w-lg px-4 pb-24 pt-28">
                {/* Avatar + identity card */}
                <section className="mb-6 rounded-3xl border border-white/40 bg-white/60 p-6 text-center shadow-[0_40px_80px_-15px_rgba(10,20,16,0.08)] backdrop-blur-xl">
                    <div className="relative mx-auto mb-4 h-24 w-24">
                        <div className="h-24 w-24 overflow-hidden rounded-full bg-[#cbe6d4] ring-4 ring-white">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#1b3d2f]">
                                    {initial}
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleAvatarClick}
                            disabled={avatarUploading}
                            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#03271a] text-white shadow-lg transition hover:bg-[#03271a]/90 disabled:opacity-60"
                        >
                            {avatarUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Camera className="h-4 w-4" />
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-[#03271a]">
                        {user.name}
                    </h1>
                    <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-[#414844]">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        <span className="rounded-full bg-[#1b3d2f]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#03271a]">
                            {user.role}
                        </span>
                        {user.verified ? (
                            <span className="flex items-center gap-1 rounded-full bg-[#cbe6d4] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1b3d2f]">
                                <ShieldCheck className="h-3 w-3" />
                                Verified
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 rounded-full bg-[#f3d9d5] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8a2f22]">
                                <ShieldAlert className="h-3 w-3" />
                                Unverified
                            </span>
                        )}
                    </div>
                </section>

                {/* Editable details */}
                <section className="mb-6 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-[0_40px_80px_-15px_rgba(10,20,16,0.08)] backdrop-blur-xl">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-bold text-[#03271a]">Personal Details</h2>
                        {!editing && (
                            <button
                                type="button"
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#03271a] hover:underline"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="rounded-2xl bg-[#f3f4f0] py-6"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="rounded-2xl bg-[#f3f4f0] py-6"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pincode">Pincode</Label>
                                    <Input
                                        id="pincode"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        className="rounded-2xl bg-[#f3f4f0] py-6"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                    className="flex-1 rounded-2xl py-6 font-bold text-[#414844]"
                                >
                                    <X className="mr-1.5 h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 rounded-2xl bg-[#03271a] py-6 font-bold text-white hover:bg-[#03271a]/90"
                                >
                                    {saving ? (
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
                            <div className="flex items-center justify-between border-b border-[#c1c8c2]/30 pb-3">
                                <span className="text-[#727974]">Full Name</span>
                                <span className="font-semibold text-[#1a1c1a]">{user.name}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-[#c1c8c2]/30 pb-3">
                                <span className="flex items-center gap-1.5 text-[#727974]">
                                    <MapPin className="h-3.5 w-3.5" />
                                    City
                                </span>
                                <span className="font-semibold text-[#1a1c1a]">
                                    {user.city || "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#727974]">Pincode</span>
                                <span className="font-semibold text-[#1a1c1a]">
                                    {user.pincode || "—"}
                                </span>
                            </div>
                        </div>
                    )}
                </section>

                {/* Order history */}
                <section className="mb-6">
                    <h2 className="mb-4 px-1 font-bold text-[#03271a]">Order History</h2>

                    {ordersLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-[#03271a]" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="rounded-3xl border border-white/40 bg-white/60 p-8 text-center shadow-sm backdrop-blur-xl">
                            <Package className="mx-auto mb-3 h-8 w-8 text-[#84a895]" />
                            <p className="text-sm text-[#414844]">
                                No orders yet. Start shopping to see them here.
                            </p>
                            <Button
                                onClick={() => navigate("/")}
                                className="mt-4 rounded-full bg-[#03271a] px-6 text-white hover:bg-[#03271a]/90"
                            >
                                Browse Marketplace
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <div
                                    key={order._id}
                                    className="rounded-2xl border border-white/80 bg-white/60 p-4 shadow-sm"
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-[#727974]">
                                            #{order._id?.slice(-8).toUpperCase()}
                                        </p>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                                                ORDER_STATUS_STYLES[order.orderStatus] ||
                                                "bg-[#e2e3df] text-[#414844]"
                                            }`}
                                        >
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-[#414844]">
                                            {order.orderItems?.length || 0} item
                                            {order.orderItems?.length === 1 ? "" : "s"} ·{" "}
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                        <p className="font-bold text-[#03271a]">
                                            ₹{order.totalPrice}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Logout */}
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full rounded-2xl py-6 font-bold text-[#8a2f22] hover:bg-[#f3d9d5]/50 hover:text-[#8a2f22]"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </Button>
            </div>
        </main>
    )
}

export default UserProfilePage
