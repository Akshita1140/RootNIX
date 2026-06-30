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

//Routes declaration
app.use('/api/v1/users',authRoutes)
app.use("/api/v1/sellers", sellerRoutes)
app.use("/api/v1/products",productsRoutes)



export {app}
