import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from './components/PrivateRoute';
import CartPage from "./pages/CartPage";
<<<<<<< HEAD
import PaymentSuccess from "./pages/PaymentSuccess"
import OrderPage from './pages/OrderPage'; // Import OrderPage component
import FeedbackForm from "./pages/feedbackForm";


=======
import TrackOrderPage from "./pages/TrackOrderPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import OrderPage from './pages/OrderPage'; 
import DeliveryDetails from './pages/DeliveryDetails'
>>>>>>> 4ccaa7146c979f03a8506a948456ea22fca4c1b4


export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Products />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route element={<PrivateRoute />}>
        <Route path='/dashboard' element={<Dashboard />} />
      </Route>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
<<<<<<< HEAD
        <Route path="/order" element={<OrderPage />} /> {/* Order page route */}
        <Route path="/feedback" element={<FeedbackForm />} />
=======
        <Route path="/payment-failed" element={<PaymentFailed />} />
>>>>>>> 4ccaa7146c979f03a8506a948456ea22fca4c1b4

        <Route path="/myOrders" element={<OrderPage />} /> 
        <Route path="/myOrders" element={<OrderPage />} />
        <Route path="/trackOrder/:orderId" element={<TrackOrderPage />} />
        <Route path="/orders/deliveryDetails" element={<DeliveryDetails />} />

      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
