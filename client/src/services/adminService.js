import api from './api';

// ── Dashboard ──────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/admin/stats');

// ── Users ──────────────────────────────────────────────────────────
export const getAllUsers = (params = {}) => api.get('/admin/users', { params });
export const toggleUserBan = (userId) => api.patch(`/admin/users/${userId}/ban`);

// ── Sellers ────────────────────────────────────────────────────────
export const getAllSellers = (params = {}) => api.get('/admin/sellers', { params });
export const updateSellerStatus = (sellerId, status) =>
    api.patch(`/admin/sellers/${sellerId}/status`, { status });

// ── Products ───────────────────────────────────────────────────────
export const getAllProductsAdmin = (params = {}) => api.get('/admin/products', { params });

// ── Orders ─────────────────────────────────────────────────────────
export const getAllOrdersAdmin = (params = {}) => api.get('/admin/orders', { params });
