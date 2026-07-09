import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice.js';
import cartReducer from './cartSlice.js';
import orderReducer from './orderSlice.js';

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    order: orderReducer,
  },
});