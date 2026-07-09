import api from './api';

// payload: { paymentMethod, shippingAddress, razorpay_order_id?, razorpay_payment_id?, razorpay_signature? }
export const createOrder = (payload) => api.post('/orders', payload);

// logged-in user's own order history
export const getMyOrders = () => api.get('/orders/my-orders');
