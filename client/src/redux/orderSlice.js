import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createOrder as createOrderApi } from '../services/orderService';

export const placeOrder = createAsyncThunk(
    'order/place',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await createOrderApi(payload);
            return res.data.data; // the created order document
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to place order');
        }
    }
);

const initialState = {
    currentOrder: null,
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(placeOrder.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(placeOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentOrder = action.payload;
            })
            .addCase(placeOrder.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
