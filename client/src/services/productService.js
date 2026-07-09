import api from './api';

export const getProducts = (params = {}) => api.get('/products', { params });
export const getProductById = (productId) => api.get(`/products/${productId}`);

// ── Seller-side product management ──────────────────────────────────

// logged-in seller's own listings (includes delisted/out-of-stock)
export const getMyListings = () => api.get('/products/my-listings');

// payload: plain object — { name, description, price, category, stock,
// careLevel?, lightRequirement?, wateringFrequency?, soilType? }, images: File[] (1-5)
export const createProduct = (payload, images = []) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== "") formData.append(key, value);
    });
    images.forEach((file) => formData.append("images", file));

    return api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// images optional — only pass if replacing product photos
export const updateProduct = (productId, payload, images = []) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== "") formData.append(key, value);
    });
    images.forEach((file) => formData.append("images", file));

    return api.patch(`/products/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// soft delete — marks isAvailable: false, doesn't remove the record
export const deleteProduct = (productId) => api.delete(`/products/${productId}`);
