import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import {
    ImagePlus,
    Info,
    Droplets,
    Sun,
    ShoppingBasket,
    Share2,
    RotateCcw,
    CheckCircle2,
    AlertTriangle,
    AlertOctagon,
    HelpCircle,
} from "lucide-react"
import Navbar from "@/components/Navbar"
import { scanPlant, getScanHistory } from "@/services/scannerService"

// health status → badge color + icon (design's error/tertiary-container tokens)
const HEALTH_META = {
    healthy: { label: "Healthy", chip: "bg-[#cbe6d4] text-[#0f5132]", icon: CheckCircle2 },
    mild_issue: { label: "Mild Issue", chip: "bg-[#f0bd8b]/40 text-[#623f18]", icon: AlertTriangle },
    needs_attention: { label: "Needs Attention", chip: "bg-[#f0bd8b] text-[#623f18]", icon: AlertTriangle },
    critical: { label: "Critical", chip: "bg-[#ffdad6] text-[#93000a]", icon: AlertOctagon },
    unknown: { label: "Inconclusive", chip: "bg-[#e2e3df] text-[#414844]", icon: HelpCircle },
}

// "2h ago", "5d ago" — no date library needed for this
const timeAgo = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime()
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
}

const ScannerPage = () => {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const progressTimer = useRef(null)

    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [status, setStatus] = useState("idle") // idle | scanning | done | failed
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const [history, setHistory] = useState([])

    useEffect(() => () => clearInterval(progressTimer.current), [])

    useEffect(() => {
        getScanHistory()
            .then((res) => setHistory(res.data.data))
            .catch(() => {}) // non-critical — page works fine without history
    }, [])

    const handleFile = (file) => {
        if (!file) return
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file")
            return
        }
        if (file.size > 8 * 1024 * 1024) {
            toast.error("Image must be under 8MB")
            return
        }
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
        setResult(null)
        setStatus("idle")
        setProgress(0)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragActive(false)
        handleFile(e.dataTransfer.files?.[0])
    }

    const handleScan = async () => {
        if (!imageFile) return
        setStatus("scanning")
        setProgress(4)

        // Real progress isn't knowable mid-request — this climbs toward 90%
        // while we wait, then the actual response snaps it to 100.
        progressTimer.current = setInterval(() => {
            setProgress((p) => (p >= 90 ? p : p + Math.floor(Math.random() * 6) + 2))
        }, 350)

        try {
            const res = await scanPlant(imageFile)
            clearInterval(progressTimer.current)
            setProgress(100)
            setTimeout(() => {
                setResult(res.data.data)
                setStatus("done")
                setHistory((prev) => [
                    { ...res.data.data, _id: `local-${Date.now()}`, createdAt: new Date().toISOString() },
                    ...prev,
                ])
            }, 300)
        } catch (err) {
            clearInterval(progressTimer.current)
            setStatus("failed")
            setProgress(0)
            toast.error(err.response?.data?.message || "Scan failed, please try again")
        }
    }

    const handleReset = () => {
        setImageFile(null)
        setImagePreview(null)
        setResult(null)
        setStatus("idle")
        setProgress(0)
    }

    const identification = result?.identification
    const health = result?.health
    const healthMeta = health?.healthStatus ? HEALTH_META[health.healthStatus] || HEALTH_META.unknown : null
    const HealthIcon = healthMeta?.icon
    const displayName = identification?.commonNames?.[0] || identification?.scientificName

    return (
        <div className="min-h-screen bg-[#f9faf6] text-[#1a1c1a]">
            <Navbar active="identifier" />

            <main className="mx-auto max-w-[1280px] px-5 pb-24 pt-32 md:px-16">
                {/* Hero */}
                <section className="mx-auto mb-16 max-w-3xl text-center">
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-[#03271a] md:text-6xl">
                        Identify Your Green Companions
                    </h1>
                    <p className="text-lg text-[#414844]">
                        Harness RootNIX AI to instantly recognize species, health issues, and care needs.
                        Just snap or upload a photo.
                    </p>
                </section>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left — interaction zone */}
                    <div className="flex flex-col gap-6 lg:col-span-7">
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            onClick={() => !imagePreview && fileInputRef.current?.click()}
                            className={`group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed transition-all md:aspect-[4/3] ${
                                imagePreview
                                    ? "border-transparent"
                                    : dragActive
                                        ? "cursor-pointer border-[#aacfbb] bg-[#f3f4f0]"
                                        : "cursor-pointer border-[#c1c8c2] bg-[#f3f4f0] hover:border-[#aacfbb]"
                            }`}
                        >
                            {!imagePreview ? (
                                <div className="flex flex-col items-center gap-6 p-12 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#c5ebd7] text-[#1b3d2f] transition-transform duration-500 group-hover:scale-110">
                                        <ImagePlus className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <p className="mb-2 text-2xl font-semibold text-[#03271a]">Drag &amp; Drop</p>
                                        <p className="text-[#414844]">or click to browse your botanical library</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <img src={imagePreview} alt="Uploaded plant" className="h-full w-full object-cover" />

                                    {status === "scanning" && (
                                        <>
                                            <div className="absolute inset-0 bg-[#03271a]/20 backdrop-brightness-75" />
                                            <div className="scanner-line absolute left-0 top-0 z-20 h-0.5 w-full bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_15px_#aacfbb]" />
                                            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl border border-white/40 bg-white/40 p-6 shadow-[0_40px_100px_-20px_rgba(10,20,16,0.08)] backdrop-blur-2xl">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#c5ebd7] border-t-transparent" />
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-widest text-[#03271a]">AI Identifier</p>
                                                        <p className="font-bold text-[#1a1c1a]">Analyzing your plant...</p>
                                                    </div>
                                                </div>
                                                <span className="text-3xl font-bold text-[#03271a]">{progress}%</span>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={(e) => handleFile(e.target.files?.[0])}
                            />
                        </div>

                        <div className="flex gap-4 rounded-3xl bg-[#e7e9e5]/50 p-4">
                            <Info className="h-5 w-5 shrink-0 text-[#03271a]" />
                            <p className="text-sm text-[#414844]">
                                Pro Tip: For best results, ensure the plant is well-lit and centered in the frame.
                            </p>
                        </div>

                        {imagePreview && status !== "scanning" && (
                            <div className="flex gap-4">
                                {status !== "done" && (
                                    <button
                                        onClick={handleScan}
                                        className="flex-1 rounded-full bg-[#03271a] px-8 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-95"
                                    >
                                        Scan Plant
                                    </button>
                                )}
                                <button
                                    onClick={handleReset}
                                    className="flex items-center justify-center gap-2 rounded-full border border-[#c1c8c2] px-6 py-3.5 text-sm font-semibold text-[#414844] transition-colors hover:bg-[#e7e9e5]"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    {status === "done" ? "Scan Another" : "Change Photo"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right — results panel */}
                    <div
                        className={`flex flex-col gap-6 transition-all duration-700 lg:col-span-5 ${
                            status === "done" ? "" : "pointer-events-none opacity-40 grayscale"
                        }`}
                    >
                        {/* Main result card */}
                        <div className="flex flex-col gap-8 rounded-[2rem] border border-white/40 bg-white/40 p-8 shadow-[0_40px_100px_-20px_rgba(10,20,16,0.08)] backdrop-blur-2xl">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <span className="mb-4 inline-flex rounded-full bg-[#cbe6d4] px-3 py-1 text-xs font-semibold text-[#506859]">
                                        {identification ? "IDENTIFIED SPECIES" : "IDENTIFICATION"}
                                    </span>
                                    <h2 className="text-3xl font-bold text-[#03271a]">
                                        {identification ? displayName : "No match yet"}
                                    </h2>
                                    <p className="italic text-[#414844]">
                                        {identification
                                            ? identification.family || identification.scientificName
                                            : "Scan a photo to see results"}
                                    </p>
                                </div>
                                {identification && (
                                    <div className="shrink-0 text-right">
                                        <div className="text-4xl font-bold text-[#aacfbb]">
                                            {identification.confidence}<span className="text-sm">%</span>
                                        </div>
                                        <p className="text-xs font-semibold text-[#414844]">CONFIDENCE</p>
                                    </div>
                                )}
                            </div>

                            {health && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-2xl bg-[#edeeea] p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Droplets className="h-4 w-4 text-[#03271a]" />
                                            <span className="text-xs font-semibold text-[#414844]">WATERING</span>
                                        </div>
                                        <p className="text-sm font-bold text-[#1a1c1a]">
                                            {health.wateringAdvice || "—"}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-[#edeeea] p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Sun className="h-4 w-4 text-[#03271a]" />
                                            <span className="text-xs font-semibold text-[#414844]">SUNLIGHT</span>
                                        </div>
                                        <p className="text-sm font-bold text-[#1a1c1a]">
                                            {health.sunlightAdvice || "—"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {health?.diagnosis && (
                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-xs font-semibold text-[#03271a]">HEALTH OVERVIEW</h3>
                                        {health.source && (
                                            <span className="rounded-full bg-[#e2e3df] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#727974]">
                                                via {health.source}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm leading-relaxed text-[#414844]">{health.diagnosis}</p>
                                </div>
                            )}

                            {identification && (
                                <div className="flex gap-4 border-t border-[#c1c8c2]/30 pt-6">
                                    <button
                                        onClick={() => navigate(`/marketplace?search=${encodeURIComponent(displayName)}`)}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#03271a] py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-95"
                                    >
                                        <ShoppingBasket className="h-4 w-4" />
                                        View in Marketplace
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard?.writeText(
                                                `${displayName} — identified on RootNIX AI Scanner`
                                            )
                                            toast.success("Copied to clipboard")
                                        }}
                                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#c1c8c2] transition-colors hover:bg-[#e7e9e5]"
                                    >
                                        <Share2 className="h-5 w-5 text-[#414844]" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Secondary bento — health status + issues, using real scan data */}
                        {health && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-3xl bg-[#502f09] p-6 text-[#c69667]">
                                    <p className="mb-2 text-xs font-semibold opacity-80">HEALTH STATUS</p>
                                    <p className="flex items-center gap-2 text-xl font-bold text-white">
                                        {healthMeta && <HealthIcon className="h-5 w-5" />}
                                        {healthMeta?.label}
                                    </p>
                                </div>
                                <div className="rounded-3xl bg-[#e2e3df] p-6">
                                    <p className="mb-2 text-xs font-semibold text-[#414844]">ISSUES FOUND</p>
                                    <p className="text-xl font-bold text-[#03271a]">{health.issues?.length || 0}</p>
                                    {health.issues?.length > 0 && (
                                        <p className="mt-2 text-xs text-[#414844]">{health.issues[0]}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Scans — last 15 days, older ones auto-delete server-side */}
                {history.length > 0 && (
                    <section className="mt-16">
                        <h2 className="mb-5 text-xl font-bold text-[#03271a]">Recent Scans</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {history.map((scan) => {
                                const meta = scan.health?.healthStatus
                                    ? HEALTH_META[scan.health.healthStatus] || HEALTH_META.unknown
                                    : null
                                const Icon = meta?.icon
                                const name = scan.identification?.commonNames?.[0] || scan.identification?.scientificName

                                return (
                                    <div
                                        key={scan._id}
                                        className="rounded-2xl border border-[#c1c8c2]/40 bg-white p-5"
                                    >
                                        <div className="mb-2 flex items-start justify-between gap-2">
                                            <p className="font-semibold text-[#03271a]">
                                                {name || "Unidentified"}
                                            </p>
                                            {meta && (
                                                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.chip}`}>
                                                    <Icon className="h-3 w-3" />
                                                    {meta.label}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#727974]">{timeAgo(scan.createdAt)}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}

export default ScannerPage
