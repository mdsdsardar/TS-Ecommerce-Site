import { configureStore } from "@reduxjs/toolkit";
import { productDetailsReducer, productReducer } from "../services/productSlice";
import { authReducer } from "../services/authSlice";
import { userReducer } from "../services/userSlice";
import { orderReducer } from "../services/orderSlice";
import { cartReducer } from "../services/cartSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    products: productReducer,
    productDetails: productDetailsReducer,
    order: orderReducer,
    cart: cartReducer,
  },
});

//useful in redux hooks.
export type RootState = ReturnType<typeof store.getState>;
// const dispatch = useDispatch<AppDispatch>();
export type AppDispatch = typeof store.dispatch;
// const products = useSelector((state: RootState) => state.products);

export default store;
