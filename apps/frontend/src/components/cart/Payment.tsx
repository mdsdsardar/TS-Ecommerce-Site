import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import toast from "react-hot-toast";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import type { StripeCardElementOptions } from "@stripe/stripe-js";
import CheckOutSteps from "./CheckOutSteps";
import api from "../../util/axios";
import { useNavigate } from "react-router-dom";
import { createOrder, clearError } from "../../services/orderSlice";
import { clearCart } from "../../services/cartSlice";
import type { AppDispatch, RootState } from "../../store/store";
import type {
  IOrder,
  IPaymentInfo,
  IShippingInfo,
} from "../../types/orderTypes";

// Update options type
const options: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
    },
    invalid: {
      color: "#b11010ff",
    },
  },
};

interface IOrderInfo {
  itemsPrice: string;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: string;
}

const Payment = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch<AppDispatch>();
  const payBtnRef = useRef<HTMLButtonElement>(null); // ✅ useRef instead of DOM query

  const { user } = useSelector((state: RootState) => state.auth);
  const { cartItems, shippingInfo } = useSelector(
    (state: RootState) => state.cart,
  );
  const { error } = useSelector((state: RootState) => state.order);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [dispatch, error]);

  // ✅ Safely parse sessionStorage
  const orderInfo: IOrderInfo | null = (() => {
    try {
      const raw = sessionStorage.getItem("orderInfo");
      return raw ? (JSON.parse(raw) as IOrderInfo) : null;
    } catch {
      return null;
    }
  })();

  if (!orderInfo) {
    return (
      <div className="text-center mt-5">
        <h4>No order information found. Please go back and try again.</h4>
      </div>
    );
  }

  const paymentData = {
    amount: Math.round(Number(orderInfo.totalPrice) * 100),
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe is not loaded yet. Please try again.");
      return;
    }
    if (!user) {
      toast.error("Please login to complete payment.");
      return;
    }

    if (payBtnRef.current) payBtnRef.current.disabled = true;

    try {
      const { data } = await api.post("/payment/process", paymentData, {
        headers: { "Content-Type": "application/json" },
      });

      const clientSecret: string = data.client_secret;
      const cardElement = elements.getElement(CardNumberElement);

      if (!cardElement) {
        toast.error("Card element not found.");
        if (payBtnRef.current) payBtnRef.current.disabled = false;
        return;
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user.name,
            email: user.email,
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message ?? "Payment failed.");
        if (payBtnRef.current) payBtnRef.current.disabled = false;
      } else {
        if (!shippingInfo.address || !shippingInfo.city) {
          throw new Error("Shipping info incomplete");
        }
        if (result.paymentIntent.status === "succeeded") {
          const order: IOrder = {
            orderItems: cartItems,
            shippingInfo: shippingInfo as IShippingInfo,
            itemPrice: Number(orderInfo.itemsPrice),
            shippingPrice: orderInfo.shippingPrice,
            taxPrice: orderInfo.taxPrice,
            totalPrice: Number(orderInfo.totalPrice),
            paymentInfo: {
              id: result.paymentIntent.id,
              status: result.paymentIntent.status,
            } as IPaymentInfo,
          };
          dispatch(createOrder(order));
          dispatch(clearCart());
          sessionStorage.removeItem("orderInfo"); // ✅ clean up after success
          navigate("/success");
          toast.success("Payment successful!");
        } else {
          toast.error("There was an issue while processing payment.");
        }
      }
    } catch (error: unknown) {
      if (payBtnRef.current) payBtnRef.current.disabled = false;
      const message =
        error instanceof Error ? error.message : "Payment processing failed";
      toast.error(message);
    }
  };

  return (
    <>
      <MetaData title="Payment" />
      <CheckOutSteps shipping confirmOrder payment />

      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form className="shadow-lg" onSubmit={submitHandler}>
            <h1 className="mb-4">Card Info</h1>

            <div className="form-group">
              <label htmlFor="card_num_field">Card Number</label>
              <CardNumberElement
                id="card_num_field"
                className="form-control"
                options={options}
              />
            </div>

            <div className="form-group">
              <label htmlFor="card_exp_field">Card Expiry</label>
              <CardExpiryElement
                id="card_exp_field"
                className="form-control"
                options={options}
              />
            </div>

            <div className="form-group">
              <label htmlFor="card_cvc_field">Card CVC</label>
              <CardCvcElement
                id="card_cvc_field"
                className="form-control"
                options={options}
              />
            </div>

            <button
              id="pay-btn"
              ref={payBtnRef}
              type="submit"
              className="btn btn-block py-3"
            >
              Pay ${Number(orderInfo.totalPrice).toFixed(2)}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Payment;
