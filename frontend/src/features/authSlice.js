import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userId:null,
    isAuthenticated: false,
    loading: false,
};
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducer:{
        setAuth(state, action) {
            state.userId=action.payload.userId;
            state.isAuthenticated=true
        },
        clearAuth(state) {
            state.userId=null;
            state.isAuthenticated=false;

        },
        setLoading(state, action) {
            state.loading=action.payload;
        }
    }
})

export const { setAuth, clearAuth, setLoading } = authSlice.actions;
export default authSlice.reducer;
