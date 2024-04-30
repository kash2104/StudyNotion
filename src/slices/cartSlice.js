import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { json } from "react-router-dom";

const initialState = {
    totalItems: localStorage.getItem('totalItems') ? JSON.parse(localStorage.getItem('totalItems')) : 0, 

    total: localStorage.getItem('total') ? JSON.parse(localStorage.getItem('total')) : 0,

    cart: localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [],
}

const cartSlice = createSlice({
    name:'cart',
    initialState:initialState,
    reducers:{
        //add to cart
        addToCart: (state, action) => {
            const course = action.payload
            const index = state.cart.findIndex((item) => item._id === course._id)

            if(index >= 0){
                //if course is already present in cart, not to update the total cart items quantity
                toast.error('Course already added to cart')
                return
            }

            //not in the cart then, add it
            state.cart.push(course)

            //update the total qty
            state.totalItems++;
            state.total += course.price

            //update the localstorage
            localStorage.setItem('cart', JSON.stringify(state.cart))
            localStorage.setItem('total', JSON.stringify(state.total))
            localStorage.setItem('totalItems', JSON.stringify(state.totalItems))

            toast.success('Course added to cart')
        }, 

        removeFromCart: (state, action) => {
            const courseId = action.payload
            const index = state.cart.findIndex((item) => item._id === courseId)

            if(index >= 0){
                //course is in the cart so remove it
                state.totalItems--
                state.total -= state.cart[index].price
                state.cart.splice(index, 1)

                //update the localstorage
                localStorage.setItem('cart', JSON.stringify(state.cart))
                localStorage.setItem('total', JSON.stringify(state.total))
                localStorage.setItem('totalItems', JSON.stringify(state.totalItems))

                toast.success('Course removed from cart')
            }
        },

        resetCart: (state) => {
            state.cart = []
            state.total = 0
            state.totalItems = 0

            // Update to localstorage
            localStorage.removeItem("cart")
            localStorage.removeItem("total")
            localStorage.removeItem("totalItems")
        }
    }
})

export const {addToCart, removeFromCart, resetCart} = cartSlice.actions;
export default cartSlice.reducer;