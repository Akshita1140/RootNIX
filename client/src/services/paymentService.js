import api from './api';

// Creates a Razorpay order for the current cart. Returns { orderId, amount, currency, key }
export const createRazorpayOrder = () => api.post('/payments/create-order');
