import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { Search, ShoppingCart, UserCircle, Menu, X } from "lucide-react"
import { useAuth } from "@/context/AuthContext.jsx"
import { Button } from "@/components/ui/button"

// active: "marketplace" | "identifier" | "exchange" | "community" | none
const Navbar = ({ active, searchValue, onSearchChange, onSearchSubmit }) => {
    const navigate = useNavigate()
    const { user, authLoading } = useAuth()
    const { totalItems: cartItemCount } = useSelector((state) => state.cart)
    const [mobileOpen, setMobileOpen] = useState(false)

    const goTo = (path) => {
        setMobileOpen(false)
        navigate(path)
    }

    const linkClass = (key) =>
        active === key
            ? "font-semibold text-[#03271a]"
            : "text-[#414844] transition hover:text-[#03271a]"

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-[#c1c8c2]/30 bg-[#f9faf6]/85 shadow-sm backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-16">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate("/")}
                        className="text-3xl font-extrabold tracking-tighter text-[#03271a]"
                    >
                        RootNIX
                    </button>

                    <div className="hidden items-center gap-6 md:flex">
                        <button onClick={() => navigate("/marketplace")} className={linkClass("marketplace")}>
                            Marketplace
                        </button>
                        <a className={linkClass("identifier")}>AI Identifier</a>
                        <a className={linkClass("exchange")}>Exchange</a>
                        <a className={linkClass("community")}>Community</a>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            onSearchSubmit?.()
                        }}
                        className="hidden items-center rounded-full border border-[#c1c8c2]/30 bg-[#f3f4f0] px-4 py-2 lg:flex"
                    >
                        <Search className="mr-2 h-4 w-4 text-[#727974]" />
                        <input
                            value={searchValue ?? ""}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            className="w-44 bg-transparent text-sm outline-none placeholder:text-[#727974]"
                            placeholder="Find a plant..."
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    onSearchSubmit?.()
                                }
                            }}
                        />
                    </form>

                    <button
                        onClick={() => navigate("/cart")}
                        className="relative rounded-full p-2 text-[#414844] transition hover:bg-[#e7e9e5]"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {cartItemCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#502f09] text-[10px] font-bold text-white">
                                {cartItemCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                user
                                    ? user.role === "admin"
                                        ? "/admin"
                                        : user.role === "seller"
                                            ? "/seller-dashboard"
                                            : "/profile"
                                    : "/login"
                            )
                        }
                        className="rounded-full p-2 text-[#414844] transition hover:bg-[#e7e9e5]"
                    >
                        <UserCircle className="h-5 w-5" />
                    </button>

                    {authLoading ? (
                        <Button disabled className="hidden rounded-full bg-[#03271a]/70 px-6 text-white md:flex">
                            Checking...
                        </Button>
                    ) : user ? (
                        <Button
                            onClick={() =>
                                navigate(
                                    user.role === "admin"
                                        ? "/admin"
                                        : user.role === "seller"
                                            ? "/seller-dashboard"
                                            : "/profile"
                                )
                            }
                            className="hidden rounded-full bg-[#03271a] px-6 text-white hover:bg-[#03271a]/90 md:flex"
                        >
                            Manage Account
                        </Button>
                    ) : (
                        <Button
                            onClick={() => navigate("/register")}
                            className="hidden rounded-full bg-[#03271a] px-6 text-white hover:bg-[#03271a]/90 md:flex"
                        >
                            Get Started
                        </Button>
                    )}

                    <button
                        onClick={() => setMobileOpen((prev) => !prev)}
                        className="rounded-full p-2 text-[#414844] transition hover:bg-[#e7e9e5] md:hidden"
                        aria-label="Toggle menu"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="border-t border-[#c1c8c2]/30 bg-[#f9faf6] px-5 pb-5 pt-3 md:hidden">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            onSearchSubmit?.()
                            setMobileOpen(false)
                        }}
                        className="mb-4 flex items-center rounded-full border border-[#c1c8c2]/30 bg-[#f3f4f0] px-4 py-2"
                    >
                        <Search className="mr-2 h-4 w-4 text-[#727974]" />
                        <input
                            value={searchValue ?? ""}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            className="w-full bg-transparent text-sm outline-none placeholder:text-[#727974]"
                            placeholder="Find a plant..."
                        />
                    </form>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => goTo("/marketplace")}
                            className={`text-left text-base ${linkClass("marketplace")}`}
                        >
                            Marketplace
                        </button>
                        <a className={`text-base ${linkClass("identifier")}`}>AI Identifier</a>
                        <a className={`text-base ${linkClass("exchange")}`}>Exchange</a>
                        <a className={`text-base ${linkClass("community")}`}>Community</a>
                    </div>

                    <div className="mt-5">
                        {authLoading ? (
                            <Button disabled className="w-full rounded-full bg-[#03271a]/70 text-white">
                                Checking...
                            </Button>
                        ) : user ? (
                            <Button
                                onClick={() =>
                                    goTo(
                                        user.role === "admin"
                                            ? "/admin"
                                            : user.role === "seller"
                                                ? "/seller-dashboard"
                                                : "/profile"
                                    )
                                }
                                className="w-full rounded-full bg-[#03271a] text-white hover:bg-[#03271a]/90"
                            >
                                Manage Account
                            </Button>
                        ) : (
                            <Button
                                onClick={() => goTo("/register")}
                                className="w-full rounded-full bg-[#03271a] text-white hover:bg-[#03271a]/90"
                            >
                                Get Started
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar