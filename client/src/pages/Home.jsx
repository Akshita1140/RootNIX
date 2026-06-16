import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext.jsx"
import {
    ArrowRight,
    Brain,
    Camera,
    Droplets,
    Heart,
    Repeat,
    Search,
    ShieldCheck,
    ShoppingBag,
    ShoppingCart,
    Sun,
    UserCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { rarePlants, plantSwaps } from "@/data/samplesData"


const Home = () => {
    const navigate = useNavigate()
    const { user, authLoading } = useAuth()

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f9faf6] text-[#1a1c1a]">
            {/* Navbar */}
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
                            <a className="font-semibold text-[#03271a]">Marketplace</a>
                            <a className="text-[#414844] transition hover:text-[#03271a]">
                                AI Identifier
                            </a>
                            <a className="text-[#414844] transition hover:text-[#03271a]">
                                Exchange
                            </a>
                            <a className="text-[#414844] transition hover:text-[#03271a]">
                                Community
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden items-center rounded-full border border-[#c1c8c2]/30 bg-[#f3f4f0] px-4 py-2 lg:flex">
                            <Search className="mr-2 h-4 w-4 text-[#727974]" />
                            <input
                                className="w-44 bg-transparent text-sm outline-none placeholder:text-[#727974]"
                                placeholder="Find a plant..."
                            />
                        </div>

                        <button className="rounded-full p-2 text-[#414844] transition hover:bg-[#e7e9e5]">
                            <ShoppingCart className="h-5 w-5" />
                        </button>

                        <button
                            onClick={() => navigate("/login")}
                            className="rounded-full p-2 text-[#414844] transition hover:bg-[#e7e9e5]"
                        >
                            <UserCircle className="h-5 w-5" />
                        </button>

                        {authLoading ? (
                            <Button
                                disabled
                                className="hidden rounded-full bg-[#03271a]/70 px-6 text-white md:flex"
                            >
                                Checking...
                            </Button>
                        ) : user ? (
                            <Button
                                onClick={() => navigate("/dashboard")}
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
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 pb-20 pt-36 md:px-16 md:pb-28 md:pt-44 lg:grid-cols-2">
                <div>
                    <span className="mb-6 inline-block rounded-full bg-[#cbe6d4] px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#344c3e]">
                        World&apos;s largest AI plant database
                    </span>

                    <h1 className="mb-8 max-w-xl text-5xl font-bold tracking-tight text-[#03271a] md:text-7xl">
                        Grow, Buy, Exchange &{" "}
                        <span className="text-[#84a895]">Identify Plants</span> with AI
                    </h1>

                    <p className="mb-10 max-w-lg text-base leading-relaxed text-[#414844]">
                        Transform your living space into a digital sanctuary. RootNIX combines
                        AI plant identification, curated plant commerce, and a local exchange
                        community for plant lovers.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Button className="rounded-full bg-[#03271a] px-8 py-6 text-base font-semibold text-white shadow-xl shadow-[#03271a]/15 hover:bg-[#03271a]/90">
                            Explore Marketplace
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>

                        <Button
                            variant="secondary"
                            className="rounded-full bg-[#e7e9e5] px-8 py-6 text-base font-semibold text-[#03271a] hover:bg-[#e2e3df]"
                        >
                            <Camera className="mr-2 h-5 w-5" />
                            Identify Plant
                        </Button>
                    </div>

                    <div className="mt-12 flex items-center gap-6">
                        <div className="flex -space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#f9faf6] bg-[#c5ebd7] font-bold text-[#03271a]">
                                A
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#f9faf6] bg-[#cee9d6] font-bold text-[#03271a]">
                                R
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#f9faf6] bg-[#03271a] text-sm font-bold text-white">
                                +2k
                            </div>
                        </div>

                        <p className="text-sm font-medium text-[#414844]">
                            Join 2,000+ plant lovers trading today
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <div className="group relative overflow-hidden rounded-[32px] shadow-[0_40px_80px_-20px_rgba(10,20,16,0.18)]">
                        <img
                            src="https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1100&q=80"
                            alt="Hero plant"
                            className="h-[520px] w-full object-cover transition duration-700 group-hover:scale-105"
                        />

                        <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-2xl">
                            <div className="mb-3 flex items-center justify-between gap-4">
                                <h3 className="text-2xl font-bold text-[#03271a]">
                                    Monstera Thai Constellation
                                </h3>
                                <span className="text-2xl font-bold text-[#502f09]">$249</span>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-[#414844]">
                                <span className="flex items-center gap-1">
                                    <Droplets className="h-4 w-4" />
                                    High Humidity
                                </span>
                                <span className="flex items-center gap-1">
                                    <Sun className="h-4 w-4" />
                                    Indirect Light
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-[#cee9d6]/50 blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 -z-10 h-60 w-60 rounded-full bg-[#aacfbb]/30 blur-3xl" />
                </div>
            </header>

            {/* Rare Plants Section - data injected using map */}
            <section className="bg-white py-24">
                <div className="mx-auto max-w-7xl px-5 md:px-16">
                    <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div>
                            <h2 className="mb-4 text-4xl font-bold text-[#03271a]">
                                Curated Rarities
                            </h2>
                            <p className="max-w-md text-[#414844]">
                                Weekly selection of exceptional species from verified botanical
                                collectors worldwide.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {rarePlants.map((plant) => (
                            <div
                                key={plant.id}
                                className="group overflow-hidden rounded-3xl border border-[#c1c8c2]/20 bg-[#f9faf6] shadow-[0_24px_60px_-30px_rgba(10,20,16,0.25)] transition duration-500 hover:-translate-y-2"
                            >
                                <div className="relative h-72 overflow-hidden">
                                    <img
                                        src={plant.image}
                                        alt={plant.name}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                    />

                                    <span className="absolute right-4 top-4 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-[#03271a] backdrop-blur-xl">
                                        {plant.tag}
                                    </span>
                                </div>

                                <div className="p-6">
                                    <div className="mb-5 flex items-start justify-between">
                                        <div>
                                            <h4 className="text-xl font-bold text-[#03271a]">
                                                {plant.name}
                                            </h4>
                                            <p className="text-xs uppercase tracking-wide text-[#414844]">
                                                Verified Seller: {plant.seller}
                                            </p>
                                        </div>

                                        <button className="text-[#414844] transition hover:text-[#03271a]">
                                            <Heart className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-[#03271a]">
                                            {plant.price}
                                        </span>

                                        <Button className="rounded-xl bg-[#03271a] text-white hover:bg-[#03271a]/90">
                                            Buy Now
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI Identification Section */}
            <section className="overflow-hidden bg-[#03271a] py-24 text-white">
                <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-5 md:px-16 lg:grid-cols-2">
                    <div className="flex justify-center">
                        <div className="relative h-[560px] w-[290px] overflow-hidden rounded-[3rem] border-8 border-[#2c4d3f] bg-black shadow-2xl">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCmIfyrPatXKxdwPdLTFBl_M0DNYjrKSj5dREkyC4m-7wpFr7pvb6ETn9Cc2iFc9UiAq0rgObxtWP7R86eO3O9FVuIxqpY_UEVcEBzTOu2k3Vb16IkkjMMP8DTIPmF8sdCV8uB1y-JNfepWgm4LIjeRQO-Y-1pxa4j5nJmbR40Zf2u4KaE0TsxnN3yw39Q9BRiBTDf7rsMaCDRO78n5xrG7vFgY3oDFnjw-roHXgtSzTnJLUY9gTdyhQrKnb2NIzatpvpiyvcW6dE"
                                alt="Plant scanning through phone camera"
                                className="h-full w-full object-cover brightness-75"
                            />

                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                <div className="relative mb-8 flex h-44 w-44 items-center justify-center rounded-3xl border-2 border-[#aacfbb] bg-[#aacfbb]/10">
                                    <Camera className="h-12 w-12" />
                                    <div className="scanner-line absolute left-0 h-1 w-full bg-[#aacfbb] shadow-[0_0_18px_#aacfbb]" />
                                </div>

                                <div className="rounded-2xl border border-white/20 bg-black/60 p-4 backdrop-blur-md">
                                    <p className="mb-1 text-xs uppercase tracking-widest text-[#aacfbb]">
                                        Matching Result
                                    </p>
                                    <h4 className="mb-2 text-xl font-bold">Maidenhair Fern</h4>
                                    <p className="text-xs opacity-80">
                                        98.4% confidence. Requires high humidity and low direct
                                        sunlight.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-8 text-5xl font-bold tracking-tight md:text-6xl">
                            Identify Any Leaf with Neural Vision
                        </h2>

                        <p className="mb-12 leading-relaxed text-[#84a895]">
                            Point your camera and get instant care guides, toxicity alerts,
                            disease checks, and market value estimates.
                        </p>

                        <div className="space-y-6">
                            <Feature
                                icon={<Brain className="h-6 w-6" />}
                                title="Deep Learning Engine"
                                text="Recognizes thousands of species with precision."
                            />
                            <Feature
                                icon={<ShieldCheck className="h-6 w-6" />}
                                title="Diagnostic Mode"
                                text="Spot pests, diseases, and nutrient deficiencies."
                            />
                            <Feature
                                icon={<ShoppingBag className="h-6 w-6" />}
                                title="Market Valuation"
                                text="Estimate value for rare plant varieties."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Plant Swaps Section - data injected using map */}
            <section className="bg-[#f9faf6] py-24">
                <div className="mx-auto max-w-7xl px-5 md:px-16">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-[#03271a]">
                            Hyper-Local Plant Swaps
                        </h2>
                        <p className="mx-auto max-w-2xl text-[#414844]">
                            Connect with nearby enthusiasts. No shipping costs, no middleman —
                            just plant love in your neighborhood.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {plantSwaps.map((swap) => (
                            <div
                                key={swap.id}
                                className="group rounded-3xl border border-[#c1c8c2]/30 bg-[#f3f4f0] p-6 transition hover:shadow-xl"
                            >
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c5ebd7] font-bold text-[#03271a]">
                                        {swap.user[0]}
                                    </div>

                                    <div>
                                        <p className="font-bold text-[#03271a]">{swap.user}</p>
                                        <p className="text-xs text-[#414844]">{swap.distance}</p>
                                    </div>
                                </div>

                                <div className="mb-4 h-40 overflow-hidden rounded-2xl bg-[#e2e3df]">
                                    <img
                                        src={swap.image}
                                        alt={swap.plant}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                    />
                                </div>

                                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#502f09]">
                                    Offering
                                </p>

                                <h5 className="mb-3 font-bold text-[#03271a]">
                                    {swap.plant}
                                </h5>

                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs italic text-[#414844]">
                                        Wants: {swap.wants}
                                    </span>

                                    <button className="flex items-center gap-1 text-sm font-bold text-[#03271a]">
                                        Swap <Repeat className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Seller CTA */}
            <section className="px-5 py-24 md:px-16">
                <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[3rem] bg-[#1b3d2f] p-10 text-white md:p-20">
                    <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#84a895]/20 blur-3xl" />

                    <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        <div>
                            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
                                Turn your green thumb into green cash.
                            </h2>

                            <p className="mb-10 max-w-lg text-[#aacfbb]">
                                Have rare props or thriving mother plants? Join our verified
                                seller network. We handle the platform; you focus on growth.
                            </p>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button className="rounded-full bg-[#c5ebd7] px-8 py-6 font-bold text-[#002115] hover:bg-[#aacfbb]">
                                    Start Selling Today
                                </Button>

                                <Button
                                    variant="outline"
                                    className="rounded-full border-[#c5ebd7] bg-transparent px-8 py-6 font-bold text-[#c5ebd7] hover:bg-[#c5ebd7]/10"
                                >
                                    View Seller Terms
                                </Button>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <img
                                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=80"
                                alt="Garden nursery"
                                className="rotate-3 rounded-3xl shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="rounded-t-3xl bg-[#e2e3df]">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 md:grid-cols-4 md:px-16">
                    <div>
                        <h3 className="mb-4 text-3xl font-bold text-[#03271a]">RootNIX</h3>
                        <p className="text-[#414844]">
                            Cultivating a smarter future through biology and technology.
                        </p>
                    </div>

                    <FooterColumn
                        title="Ecosystem"
                        items={[
                            "Marketplace",
                            "AI Identification",
                            "Community Swaps",
                            "Plant Library",
                        ]}
                    />

                    <FooterColumn
                        title="Resources"
                        items={[
                            "API Documentation",
                            "Seller Terms",
                            "Sustainability Report",
                            "Privacy Policy",
                        ]}
                    />

                    <div>
                        <h5 className="mb-4 font-bold text-[#03271a]">Newsletter</h5>
                        <p className="mb-4 text-[#414844]">
                            Get the latest botanical trends and rare drops.
                        </p>

                        <div className="flex flex-col gap-2">
                            <input
                                className="rounded-xl bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#03271a]"
                                placeholder="Email address"
                            />
                            <Button className="rounded-xl bg-[#03271a] text-white hover:bg-[#03271a]/90">
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#c1c8c2]/40 py-6 text-center text-xs text-[#414844]">
                    © 2026 RootNIX AI. Cultivating a smarter future.
                </div>
            </footer>
        </div>
    )
}

const Feature = ({ icon, title, text }) => {
    return (
        <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#1b3d2f] text-[#aacfbb]">
                {icon}
            </div>
            <div>
                <h4 className="mb-1 text-lg font-bold text-white">{title}</h4>
                <p className="text-sm text-[#84a895]">{text}</p>
            </div>
        </div>
    )
}

const FooterColumn = ({ title, items }) => {
    return (
        <div>
            <h5 className="mb-4 font-bold text-[#03271a]">{title}</h5>
            <ul className="space-y-3">
                {items.map((item) => (
                    <li key={item}>
                        <a className="cursor-pointer text-[#414844] transition hover:text-[#03271a]">
                            {item}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Home