import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    //reload karne par user directly null ho rha when user:null kiya toh but we need to fetch from localStorage and agar vaha se na mile toh null set karna hai. IMPORTANT TO STORE IN LOCALSTORAGE
    user:localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')): null,
    loading: false,
}

const profileSlice = createSlice({
    name:'profile',
    initialState:initialState,
    reducers:{
        setUser(state, value){
            state.user = value.payload
        },
        setLoading(state,value){
            state.loading = value.loading
        }
    }
})

export const {setUser, setLoading} = profileSlice.actions;
export default profileSlice.reducer;