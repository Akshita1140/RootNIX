import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials:true
}))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static('public'))
app.use(cookieParser())

// Routes
import authRoutes from './routes/auth.routes.js'
import sellerRoutes from "./routes/seller.routes.js"
import productsRoutes from "./routes/product.routes.js"
import paymentsRoutes from "./routes/payments.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import orderRoutes from "./routes/order.routes.js"

//Routes declaration
app.use('/api/v1/users',authRoutes)
app.use("/api/v1/sellers", sellerRoutes)
app.use("/api/v1/products",productsRoutes)
app.use("/api/v1/payments",paymentsRoutes)
app.use("/api/v1/cart",cartRoutes)
app.use("/api/v1/orders",orderRoutes)


console.log(process.cwd())

export {app}
