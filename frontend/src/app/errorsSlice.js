import { createSlice } from '@reduxjs/toolkit'

export const errorsSlice = createSlice({
    name: 'errors',
    initialState: [],
    reducers: {
        clearErrors: (state, action) => {
            return [];
        },
        appendError: (state, action) => {
            return [...state, action.payload];
        },
        removeError: (state, action) => {
            return state.filter( (error, index) => index !== action.payload);
        },
    },
});


export const { appendError, removeError, clearErrors } = errorsSlice.actions;

export default errorsSlice.reducer;

