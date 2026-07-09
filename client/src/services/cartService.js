import api from './api';

export const getCart = () => api.get('/cart');
export const addToCart = (productId, quantity = 1) =>
    api.post('/cart/add', { productId, quantity });
export const updateCartItem = (productId, quantity) =>
    api.patch('/cart/update', { productId, quantity });
export const removeFromCart = (productId) =>
    api.delete(`/cart/remove/${productId}`);
export const clearCart = () => api.delete('/cart/clear');
