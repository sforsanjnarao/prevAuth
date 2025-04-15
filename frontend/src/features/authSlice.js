import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userId:null,
    isAuthenticated: false,
    loading: false,
};
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers:{
        setAuth(state, action) {
            state.userId=action.payload.userId;
            state.accessToken=action.payload.accessToken;
            state.isAuthenticated=false
        },
        clearAuth(state) {
            state.userId=null;
            state.accessToken=null;
            state.isAuthenticated=false;

        },
        setAccessToken(state, action) {
            state.accessToken=action.payload;
        },
        setLoading(state, action) {
            state.loading=action.payload;
        }
    }
})

export const { setAuth, clearAuth, setLoading,setAccessToken } = authSlice.actions;
export default authSlice.reducer;
