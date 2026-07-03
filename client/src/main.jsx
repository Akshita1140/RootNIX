import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { Provider } from "react-redux"

import App from "./App.jsx"
import "./index.css"
import { AuthProvider } from "./context/AuthContext.jsx"
import { store } from "./redux/store.js"

createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        <BrowserRouter>
            <AuthProvider>
                <App />
                <Toaster position="top-right" />
            </AuthProvider>
        </BrowserRouter>
    </Provider>
)