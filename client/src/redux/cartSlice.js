import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getCart,
    addToCart as addToCartApi,
    updateCartItem as updateCartItemApi,
    removeFromCart as removeFromCartApi,
    clearCart as clearCartApi,
} from '../services/cartService';

export const fetchCart = createAsyncThunk(
    'cart/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getCart();
            return res.data.data; // { items, totalItems, totalAmount } — ApiResponse wrapper
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
        }
    }
);

export const addItemToCart = createAsyncThunk(
    'cart/addItem',
    async ({ productId, quantity = 1 }, { rejectWithValue }) => {
        try {
            const res = await addToCartApi(productId, quantity);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to add item');
        }
    }
);

export const updateItemQuantity = createAsyncThunk(
    'cart/updateItem',
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const res = await updateCartItemApi(productId, quantity);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update item');
        }
    }
);

export const removeItemFromCart = createAsyncThunk(
    'cart/removeItem',
    async (productId, { rejectWithValue }) => {
        try {
            const res = await removeFromCartApi(productId);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to remove item');
        }
    }
);

export const clearUserCart = createAsyncThunk(
    'cart/clear',
    async (_, { rejectWithValue }) => {
        try {
            const res = await clearCartApi();
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
        }
    }
);

const initialState = {
    items: [],
    totalItems: 0,
    totalAmount: 0,
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
    // separate flag for item-level mutations so the whole page doesn't
    // show a full loading state on every +/- click
    mutating: false,
};

const applyCartPayload = (state, payload) => {
    state.items = payload.items || [];
    state.totalItems = payload.totalItems ?? 0;
    state.totalAmount = payload.totalAmount ?? 0;
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                applyCartPayload(state, action.payload);
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // Shared handling for all mutation thunks
        [addItemToCart, updateItemQuantity, removeItemFromCart, clearUserCart].forEach(
            (thunk) => {
                builder
                    .addCase(thunk.pending, (state) => {
                        state.mutating = true;
                        state.error = null;
                    })
                    .addCase(thunk.fulfilled, (state, action) => {
                        state.mutating = false;
                        applyCartPayload(state, action.payload);
                    })
                    .addCase(thunk.rejected, (state, action) => {
                        state.mutating = false;
                        state.error = action.payload;
                    });
            }
        );
    },
});

export default cartSlice.reducer;
