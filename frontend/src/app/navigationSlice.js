import { createSlice } from '@reduxjs/toolkit'

export const navigationSlice = createSlice({
    name: 'navigation',
    initialState: {
        path: 'dashboard',
    },
    reducers: {
        setPath: (state, action) => {
            state.path = action.payload
        },
    },
});


export const { setPath } = navigationSlice.actions;
export default navigationSlice.reducer;
