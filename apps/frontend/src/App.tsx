import { useDispatch } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";

import api from "./util/axios";
import { loadUser, setLoading } from "./services/authSlice";
import type { AppDispatch } from "./store/store";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import UserLayout from "./components/layout/UserLayout";
import ProtectedRoute from "./components/routes/ProtectedRoute";

import Home from "./components/home";
import ProductDetails from "./components/product/ProductDetails";
import Login from "./components/user/Login";
import Register from "./components/user/Register";
import Profile from "./components/user/Profile";
import UpdateProfile from "./components/user/UpdateProfile";
import UpdatePassword from "./components/user/UpdatePassword";
import { ForgotPassword } from "./components/user/ForgotPassword";
import { NewPassword } from "./components/user/NewPassword";

import { Cart } from "./components/cart/Cart";
import Shipping from "./components/cart/Shipping";
import ConfirmOrder from "./components/cart/ConfirmOrder";
import Payment from "./components/cart/Payment";
import OrderSuccess from "./components/cart/OrderSuccess";
import ListOrders from "./components/cart/ListOrder";
import OrderDetails from "./components/cart/OrderDetails";

import Dashboard from "./components/admin/Dashboard";
import ProductsList from "./components/admin/ProductList";
import NewProduct from "./components/admin/NewProduct";
import UpdateProduct from "./components/admin/UpdateProduct";
import OrderList from "./components/admin/OrderList";
import ProcessOrder from "./components/admin/ProcessOrder";
import UserList from "./components/admin/UserList";
import UpdateUser from "./components/admin/UpdateUser";
import ProductReviews from "./components/admin/ProductReview";

// ✅ Load stripe outside component to avoid recreating on every render
let stripePromise: Promise<Stripe | null>;
const getStripe = (key: string) => {
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const [stripeApiKey, setStripeApiKey] = useState<string>("");

  useEffect(() => {
    dispatch(setLoading(true));
    dispatch(loadUser());

    api
      .get("/stripeapi")
      .then((res) => {
        setStripeApiKey(res.data.stripeApiKey as string);
      })
      .catch(() => {
        console.error("Failed to load Stripe API key");
      });
  }, [dispatch]);

  return (
    <Router>
      <Header />
      <Routes>
        {/* Routes WITH container wrapper */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search/:keyword" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<NewPassword />} />

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/me" element={<Profile />} />
            <Route path="/me/update" element={<UpdateProfile />} />
            <Route path="/password/update" element={<UpdatePassword />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/order/confirm" element={<ConfirmOrder />} />
            <Route path="/orders/me" element={<ListOrders />} />
            <Route path="/order/:id" element={<OrderDetails />} />
            <Route path="/success" element={<OrderSuccess />} />
            <Route
              path="/payment"
              element={
                stripeApiKey ? (
                  <Elements stripe={getStripe(stripeApiKey)}>
                    <Payment />
                  </Elements>
                ) : null
              }
            />
          </Route>
        </Route>

        {/* Admin routes WITHOUT container wrapper */}
        <Route element={<ProtectedRoute isAdmin />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<ProductsList />} />
          <Route path="/admin/product" element={<NewProduct />} />
          <Route path="/admin/products/:id" element={<UpdateProduct />} />
          <Route path="/admin/orders" element={<OrderList />} />
          <Route path="/admin/order/:id" element={<ProcessOrder />} />
          <Route path="/admin/users" element={<UserList />} />
          <Route path="/admin/user/:id" element={<UpdateUser />} />
          <Route path="/admin/reviews" element={<ProductReviews />} />
        </Route>
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
