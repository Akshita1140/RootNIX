import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

// CORS_ORIGIN can be a single URL or a comma-separated list (e.g. Vercel
// production domain + preview deployments). Falls back to local dev.
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map(o => o.trim())

app.use(cors({
    origin: (origin, callback) => {
        // allow non-browser requests (curl, server-to-server, Render health checks)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)
        return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials:true
}))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static('public'))
app.use(cookieParser())

// Health check — Render pings this to know the service is alive
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

// Routes
import authRoutes from './routes/auth.routes.js'
import sellerRoutes from "./routes/seller.routes.js"
import productsRoutes from "./routes/product.routes.js"
import paymentsRoutes from "./routes/payments.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import orderRoutes from "./routes/order.routes.js"
import adminRoutes from "./routes/admin.routes.js"

//Routes declaration
app.use('/api/v1/users',authRoutes)
app.use("/api/v1/sellers", sellerRoutes)
app.use("/api/v1/products",productsRoutes)
app.use("/api/v1/payments",paymentsRoutes)
app.use("/api/v1/cart",cartRoutes)
app.use("/api/v1/orders",orderRoutes)
app.use("/api/v1/admin",adminRoutes)

// Global error handler — must be registered after all routes so it can
// catch errors passed via next(err) from any route/controller/middleware.
import { errorHandler } from "./middleware/error.middleware.js"
app.use(errorHandler)


export {app}
