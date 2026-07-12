import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import {
    LayoutDashboard,
    Store,
    Users,
    Package,
    ShoppingBag,
    LogOut,
    Loader2,
    ShieldCheck,
    ShieldX,
    ShieldQuestion,
    Ban,
    IndianRupee,
    Sprout,
    UserCog,
} from "lucide-react"

import { useAuth } from "@/context/AuthContext.jsx"
import { Button } from "@/components/ui/button"
import {
    getDashboardStats,
    getAllUsers,
    toggleUserBan,
    getAllSellers,
    updateSellerStatus,
    getAllProductsAdmin,
    getAllOrdersAdmin,
} from "@/services/adminService"
import { deleteProduct } from "@/services/productService"

const TABS = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "sellers", label: "Sellers", icon: Store },
    { key: "users", label: "Users", icon: Users },
    { key: "products", label: "Products", icon: Package },
    { key: "orders", label: "Orders", icon: ShoppingBag },
]

const AdminDashboardPage = () => {
    const navigate = useNavigate()
    const { user, logoutUser } = useAuth()
    const [activeTab, setActiveTab] = useState("overview")

    const handleLogout = async () => {
        await logoutUser()
        navigate("/login")
    }

    return (
        <div className="min-h-screen bg-[#f9faf6] text-[#1a1c1a]">
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside className="hidden w-64 flex-col border-r border-[#c1c8c2]/30 bg-white px-4 py-6 md:flex">
                    <div className="mb-8 flex items-center gap-2 px-2">
                        <Sprout className="h-7 w-7 text-[#03271a]" />
                        <div>
                            <p className="text-lg font-extrabold tracking-tight text-[#03271a]">RootNIX</p>
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#414844]">
                                Admin Panel
                            </p>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {TABS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                    activeTab === key
                                        ? "bg-[#03271a] text-white"
                                        : "text-[#414844] hover:bg-[#e7e9e5]"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className="border-t border-[#c1c8c2]/30 pt-4">
                        <p className="mb-2 truncate px-2 text-xs text-[#414844]">{user?.email}</p>
                        <Button
                            onClick={handleLogout}
                            variant="secondary"
                            className="flex w-full items-center gap-2 rounded-xl bg-[#e7e9e5] text-[#03271a] hover:bg-[#dfe2dc]"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </aside>

                {/* Mobile tab bar */}
                <div className="fixed inset-x-0 top-0 z-40 flex items-center gap-1 overflow-x-auto border-b border-[#c1c8c2]/30 bg-white px-2 py-2 md:hidden">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex flex-none items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                activeTab === key
                                    ? "bg-[#03271a] text-white"
                                    : "text-[#414844]"
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </button>
                    ))}
                    <button
                        onClick={handleLogout}
                        aria-label="Logout"
                        className="ml-auto flex flex-none items-center gap-1.5 rounded-full bg-[#fbe4e4] px-3 py-1.5 text-xs font-semibold text-[#8a1c1c]"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Logout
                    </button>
                </div>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto px-5 py-8 pt-20 md:px-10 md:pt-8">
                    {activeTab === "overview" && <OverviewTab />}
                    {activeTab === "sellers" && <SellersTab />}
                    {activeTab === "users" && <UsersTab />}
                    {activeTab === "products" && <ProductsTab />}
                    {activeTab === "orders" && <OrdersTab />}
                </main>
            </div>
        </div>
    )
}

// ── Shared bits ──────────────────────────────────────────────────────

const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#03271a]">{title}</h1>
        {subtitle && <p className="mt-1 text-[#414844]">{subtitle}</p>}
    </div>
)

const LoadingBlock = () => (
    <div className="flex items-center justify-center py-24 text-[#414844]">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading...
    </div>
)

const EmptyBlock = ({ text }) => (
    <div className="py-16 text-center text-[#414844]">{text}</div>
)

const Pagination = ({ pagination, page, setPage }) => {
    if (!pagination || pagination.totalPages <= 1) return null
    return (
        <div className="mt-6 flex items-center justify-center gap-4">
            <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-[#c1c8c2]/40 bg-white px-4 py-1.5 text-sm font-semibold text-[#03271a] disabled:opacity-40"
            >
                Prev
            </button>
            <span className="text-sm text-[#414844]">
                Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="rounded-full border border-[#c1c8c2]/40 bg-white px-4 py-1.5 text-sm font-semibold text-[#03271a] disabled:opacity-40"
            >
                Next
            </button>
        </div>
    )
}

// ── Overview ─────────────────────────────────────────────────────────

const OverviewTab = () => {
    const [stats, setStats] = useState(null)
    const [status, setStatus] = useState("loading")

    useEffect(() => {
        let cancelled = false
        setStatus("loading")
        getDashboardStats()
            .then((res) => {
                if (cancelled) return
                setStats(res.data.data)
                setStatus("succeeded")
            })
            .catch((err) => {
                if (cancelled) return
                setStatus("failed")
                toast.error(err.response?.data?.message || "Failed to load stats")
            })
        return () => {
            cancelled = true
        }
    }, [])

    if (status === "loading") return <LoadingBlock />
    if (status === "failed" || !stats) return <EmptyBlock text="Could not load dashboard stats." />

    const cards = [
        { label: "Total Users", value: stats.totalUsers, icon: Users },
        { label: "Buyers", value: stats.totalBuyers, icon: UserCog },
        { label: "Sellers", value: stats.totalSellers, icon: Store },
        { label: "Pending Seller Approvals", value: stats.pendingSellers, icon: ShieldQuestion, highlight: stats.pendingSellers > 0 },
        { label: "Total Products", value: stats.totalProducts, icon: Package },
        { label: "Active Listings", value: stats.activeProducts, icon: Sprout },
        { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag },
        { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee },
    ]

    return (
        <div>
            <SectionHeader title="Overview" subtitle="Platform-wide snapshot, updated live." />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map(({ label, value, icon: Icon, highlight }) => (
                    <div
                        key={label}
                        className={`rounded-2xl border p-5 shadow-sm ${
                            highlight
                                ? "border-[#e0a94a]/50 bg-[#fff6e6]"
                                : "border-[#c1c8c2]/30 bg-white"
                        }`}
                    >
                        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#414844]">
                            <Icon className="h-4 w-4" />
                            {label}
                        </div>
                        <p className="text-2xl font-bold text-[#03271a]">{value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ── Sellers ──────────────────────────────────────────────────────────

const STATUS_BADGE_STYLES = {
    pending: "bg-[#fff6e6] text-[#8a5a00]",
    approved: "bg-[#e3f3e6] text-[#1c5e2c]",
    rejected: "bg-[#fbe4e4] text-[#8a1c1c]",
    suspended: "bg-[#eee] text-[#414844]",
}

const SellersTab = () => {
    const [sellers, setSellers] = useState([])
    const [pagination, setPagination] = useState(null)
    const [status, setStatus] = useState("loading")
    const [statusFilter, setStatusFilter] = useState("")
    const [page, setPage] = useState(1)
    const [actingId, setActingId] = useState(null)

    const load = useCallback(() => {
        setStatus("loading")
        getAllSellers({ status: statusFilter || undefined, page, limit: 10 })
            .then((res) => {
                setSellers(res.data.data.sellers)
                setPagination(res.data.data.pagination)
                setStatus("succeeded")
            })
            .catch((err) => {
                setStatus("failed")
                toast.error(err.response?.data?.message || "Failed to load sellers")
            })
    }, [statusFilter, page])

    useEffect(() => {
        load()
    }, [load])

    const handleStatusChange = (sellerId, newStatus) => {
        setActingId(sellerId)
        updateSellerStatus(sellerId, newStatus)
            .then(() => {
                toast.success(`Seller ${newStatus}`)
                load()
            })
            .catch((err) => toast.error(err.response?.data?.message || "Action failed"))
            .finally(() => setActingId(null))
    }

    return (
        <div>
            <SectionHeader title="Sellers" subtitle="Approve, reject, or suspend seller accounts." />

            <div className="mb-6 flex flex-wrap gap-2">
                {["", "pending", "approved", "rejected", "suspended"].map((s) => (
                    <button
                        key={s || "all"}
                        onClick={() => {
                            setStatusFilter(s)
                            setPage(1)
                        }}
                        className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition ${
                            statusFilter === s
                                ? "border-[#03271a] bg-[#03271a] text-white"
                                : "border-[#c1c8c2]/40 bg-white text-[#414844] hover:bg-[#e7e9e5]"
                        }`}
                    >
                        {s || "All"}
                    </button>
                ))}
            </div>

            {status === "loading" ? (
                <LoadingBlock />
            ) : sellers.length === 0 ? (
                <EmptyBlock text="No sellers match this filter." />
            ) : (
                <div className="space-y-4">
                    {sellers.map((seller) => (
                        <div
                            key={seller._id}
                            className="flex flex-col gap-4 rounded-2xl border border-[#c1c8c2]/30 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <div className="mb-1 flex items-center gap-2">
                                    <h3 className="font-bold text-[#03271a]">{seller.shopName}</h3>
                                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_BADGE_STYLES[seller.status]}`}>
                                        {seller.status}
                                    </span>
                                </div>
                                <p className="text-sm text-[#414844]">
                                    {seller.user?.name} · {seller.user?.email}
                                </p>
                                <p className="text-xs text-[#727974]">
                                    {seller.city} · {seller.businessPhone}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {seller.status !== "approved" && (
                                    <Button
                                        size="sm"
                                        disabled={actingId === seller._id}
                                        onClick={() => handleStatusChange(seller._id, "approved")}
                                        className="rounded-full bg-[#1c5e2c] text-white hover:bg-[#1c5e2c]/90"
                                    >
                                        <ShieldCheck className="mr-1 h-4 w-4" />
                                        Approve
                                    </Button>
                                )}
                                {seller.status !== "rejected" && (
                                    <Button
                                        size="sm"
                                        disabled={actingId === seller._id}
                                        onClick={() => handleStatusChange(seller._id, "rejected")}
                                        variant="secondary"
                                        className="rounded-full bg-[#fbe4e4] text-[#8a1c1c] hover:bg-[#f7d0d0]"
                                    >
                                        <ShieldX className="mr-1 h-4 w-4" />
                                        Reject
                                    </Button>
                                )}
                                {seller.status !== "suspended" && (
                                    <Button
                                        size="sm"
                                        disabled={actingId === seller._id}
                                        onClick={() => handleStatusChange(seller._id, "suspended")}
                                        variant="secondary"
                                        className="rounded-full bg-[#eee] text-[#414844] hover:bg-[#e0e0e0]"
                                    >
                                        <Ban className="mr-1 h-4 w-4" />
                                        Suspend
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination pagination={pagination} page={page} setPage={setPage} />
        </div>
    )
}

// ── Users ────────────────────────────────────────────────────────────

const UsersTab = () => {
    const [users, setUsers] = useState([])
    const [pagination, setPagination] = useState(null)
    const [status, setStatus] = useState("loading")
    const [roleFilter, setRoleFilter] = useState("")
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [actingId, setActingId] = useState(null)

    const load = useCallback(() => {
        setStatus("loading")
        getAllUsers({ role: roleFilter || undefined, search: search || undefined, page, limit: 10 })
            .then((res) => {
                setUsers(res.data.data.users)
                setPagination(res.data.data.pagination)
                setStatus("succeeded")
            })
            .catch((err) => {
                setStatus("failed")
                toast.error(err.response?.data?.message || "Failed to load users")
            })
    }, [roleFilter, search, page])

    useEffect(() => {
        load()
    }, [load])

    const handleToggleBan = (userId) => {
        setActingId(userId)
        toggleUserBan(userId)
            .then((res) => {
                toast.success(res.data.message)
                load()
            })
            .catch((err) => toast.error(err.response?.data?.message || "Action failed"))
            .finally(() => setActingId(null))
    }

    return (
        <div>
            <SectionHeader title="Users" subtitle="View all accounts and manage access." />

            <div className="mb-6 flex flex-wrap items-center gap-3">
                {["", "user", "seller", "admin"].map((r) => (
                    <button
                        key={r || "all"}
                        onClick={() => {
                            setRoleFilter(r)
                            setPage(1)
                        }}
                        className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition ${
                            roleFilter === r
                                ? "border-[#03271a] bg-[#03271a] text-white"
                                : "border-[#c1c8c2]/40 bg-white text-[#414844] hover:bg-[#e7e9e5]"
                        }`}
                    >
                        {r || "All roles"}
                    </button>
                ))}
                <input
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setPage(1)
                    }}
                    placeholder="Search name or email..."
                    className="ml-auto w-full max-w-xs rounded-full border border-[#c1c8c2]/40 bg-white px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#03271a]"
                />
            </div>

            {status === "loading" ? (
                <LoadingBlock />
            ) : users.length === 0 ? (
                <EmptyBlock text="No users match this filter." />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#c1c8c2]/30 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-[#c1c8c2]/30 text-xs uppercase tracking-widest text-[#414844]">
                            <tr>
                                <th className="px-5 py-3">Name</th>
                                <th className="px-5 py-3">Email</th>
                                <th className="px-5 py-3">Role</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id} className="border-b border-[#c1c8c2]/15 last:border-0">
                                    <td className="px-5 py-3 font-semibold text-[#03271a]">{u.name}</td>
                                    <td className="px-5 py-3 text-[#414844]">{u.email}</td>
                                    <td className="px-5 py-3 capitalize text-[#414844]">{u.role}</td>
                                    <td className="px-5 py-3">
                                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${u.isBanned ? "bg-[#fbe4e4] text-[#8a1c1c]" : "bg-[#e3f3e6] text-[#1c5e2c]"}`}>
                                            {u.isBanned ? "Banned" : "Active"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        {u.role !== "admin" && (
                                            <Button
                                                size="sm"
                                                disabled={actingId === u._id}
                                                onClick={() => handleToggleBan(u._id)}
                                                variant="secondary"
                                                className={`rounded-full ${u.isBanned ? "bg-[#e3f3e6] text-[#1c5e2c] hover:bg-[#d3ead6]" : "bg-[#fbe4e4] text-[#8a1c1c] hover:bg-[#f7d0d0]"}`}
                                            >
                                                {u.isBanned ? "Unban" : "Ban"}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination pagination={pagination} page={page} setPage={setPage} />
        </div>
    )
}

// ── Products ─────────────────────────────────────────────────────────

const ProductsTab = () => {
    const [products, setProducts] = useState([])
    const [pagination, setPagination] = useState(null)
    const [status, setStatus] = useState("loading")
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [actingId, setActingId] = useState(null)

    const load = useCallback(() => {
        setStatus("loading")
        getAllProductsAdmin({ search: search || undefined, page, limit: 10 })
            .then((res) => {
                setProducts(res.data.data.products)
                setPagination(res.data.data.pagination)
                setStatus("succeeded")
            })
            .catch((err) => {
                setStatus("failed")
                toast.error(err.response?.data?.message || "Failed to load products")
            })
    }, [search, page])

    useEffect(() => {
        load()
    }, [load])

    const handleDelist = (productId) => {
        if (!window.confirm("Delist this product? It will be hidden from the marketplace.")) return
        setActingId(productId)
        deleteProduct(productId)
            .then(() => {
                toast.success("Product delisted")
                load()
            })
            .catch((err) => toast.error(err.response?.data?.message || "Action failed"))
            .finally(() => setActingId(null))
    }

    return (
        <div>
            <SectionHeader title="Products" subtitle="Every listing across all sellers." />

            <input
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                }}
                placeholder="Search products..."
                className="mb-6 w-full max-w-xs rounded-full border border-[#c1c8c2]/40 bg-white px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#03271a]"
            />

            {status === "loading" ? (
                <LoadingBlock />
            ) : products.length === 0 ? (
                <EmptyBlock text="No products match this search." />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((p) => (
                        <div key={p._id} className="rounded-2xl border border-[#c1c8c2]/30 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-[#e2e3df]">
                                {p.images?.[0]?.url && (
                                    <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                                )}
                            </div>
                            <div className="mb-2 flex items-start justify-between gap-2">
                                <h4 className="font-bold text-[#03271a]">{p.name}</h4>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.isAvailable ? "bg-[#e3f3e6] text-[#1c5e2c]" : "bg-[#eee] text-[#414844]"}`}>
                                    {p.isAvailable ? "Live" : "Hidden"}
                                </span>
                            </div>
                            <p className="mb-1 text-xs text-[#414844]">{p.seller?.name} · {p.seller?.email}</p>
                            <p className="mb-3 text-sm font-semibold text-[#03271a]">₹{p.price} · Stock: {p.stock}</p>
                            {p.isAvailable && (
                                <Button
                                    size="sm"
                                    disabled={actingId === p._id}
                                    onClick={() => handleDelist(p._id)}
                                    variant="secondary"
                                    className="w-full rounded-full bg-[#fbe4e4] text-[#8a1c1c] hover:bg-[#f7d0d0]"
                                >
                                    Delist
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Pagination pagination={pagination} page={page} setPage={setPage} />
        </div>
    )
}

// ── Orders ───────────────────────────────────────────────────────────

const ORDER_STATUS_STYLES = {
    pending: "bg-[#fff6e6] text-[#8a5a00]",
    confirmed: "bg-[#e6f0fb] text-[#1c4a8a]",
    shipped: "bg-[#eee6fb] text-[#5a1c8a]",
    delivered: "bg-[#e3f3e6] text-[#1c5e2c]",
    cancelled: "bg-[#fbe4e4] text-[#8a1c1c]",
}

const OrdersTab = () => {
    const [orders, setOrders] = useState([])
    const [pagination, setPagination] = useState(null)
    const [status, setStatus] = useState("loading")
    const [statusFilter, setStatusFilter] = useState("")
    const [page, setPage] = useState(1)

    const load = useCallback(() => {
        setStatus("loading")
        getAllOrdersAdmin({ status: statusFilter || undefined, page, limit: 10 })
            .then((res) => {
                setOrders(res.data.data.orders)
                setPagination(res.data.data.pagination)
                setStatus("succeeded")
            })
            .catch((err) => {
                setStatus("failed")
                toast.error(err.response?.data?.message || "Failed to load orders")
            })
    }, [statusFilter, page])

    useEffect(() => {
        load()
    }, [load])

    return (
        <div>
            <SectionHeader title="Orders" subtitle="All orders placed across the platform." />

            <div className="mb-6 flex flex-wrap gap-2">
                {["", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                    <button
                        key={s || "all"}
                        onClick={() => {
                            setStatusFilter(s)
                            setPage(1)
                        }}
                        className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition ${
                            statusFilter === s
                                ? "border-[#03271a] bg-[#03271a] text-white"
                                : "border-[#c1c8c2]/40 bg-white text-[#414844] hover:bg-[#e7e9e5]"
                        }`}
                    >
                        {s || "All"}
                    </button>
                ))}
            </div>

            {status === "loading" ? (
                <LoadingBlock />
            ) : orders.length === 0 ? (
                <EmptyBlock text="No orders match this filter." />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#c1c8c2]/30 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-[#c1c8c2]/30 text-xs uppercase tracking-widest text-[#414844]">
                            <tr>
                                <th className="px-5 py-3">Order</th>
                                <th className="px-5 py-3">Buyer</th>
                                <th className="px-5 py-3">Items</th>
                                <th className="px-5 py-3">Total</th>
                                <th className="px-5 py-3">Payment</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o._id} className="border-b border-[#c1c8c2]/15 last:border-0">
                                    <td className="px-5 py-3 font-mono text-xs text-[#414844]">{o._id.slice(-8)}</td>
                                    <td className="px-5 py-3 text-[#414844]">{o.user?.name || "—"}</td>
                                    <td className="px-5 py-3 text-[#414844]">{o.orderItems?.length} item(s)</td>
                                    <td className="px-5 py-3 font-semibold text-[#03271a]">₹{o.totalPrice}</td>
                                    <td className="px-5 py-3 capitalize text-[#414844]">
                                        {o.paymentInfo?.method} · {o.paymentInfo?.status}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${ORDER_STATUS_STYLES[o.orderStatus]}`}>
                                            {o.orderStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination pagination={pagination} page={page} setPage={setPage} />
        </div>
    )
}

export default AdminDashboardPage
