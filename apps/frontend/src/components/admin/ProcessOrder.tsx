import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "../layout/Loader";
import toast from "react-hot-toast";
import Sidebar from "./Sidebar";
import {
  updateOrder,
  clearError,
  orderDetails,
  updateOrderReset,
} from "../../services/orderSlice";
import type { AppDispatch, RootState } from "../../store/store";

const ProcessOrder = () => {
  const [status, setStatus] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const { loading, order, error, isUpdated } = useSelector(
    (state: RootState) => state.order,
  );

  useEffect(() => {
    if (!id) return;
    dispatch(orderDetails(id));
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (isUpdated) {
      toast.success("Order updated successfully.");
      dispatch(updateOrderReset());
      navigate("/admin/orders");
    }
  }, [dispatch, error, isUpdated, id, navigate]);

  const submitHandler = () => {
    if (!id || !status) {
      toast.error("Please select a status");
      return;
    }
    dispatch(updateOrder({ id, orderData: { orderStatus: status } }));
  };

  if (loading) return <Loader />;
  if (!order || Array.isArray(order)) return null;

  const {
    shippingInfo,
    orderItems,
    user,
    paymentInfo,
    totalPrice,
    orderStatus,
  } = order;

  const shippingDetails = shippingInfo
    ? [
        shippingInfo.address,
        shippingInfo.city,
        shippingInfo.postalCode,
        shippingInfo.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "N/A";

  const isPaid = paymentInfo?.status === "succeeded";
  const isDelivered = orderStatus === "Delivered";

  return (
    <>
      <MetaData title={`Process Order # ${id}`} />
      <div className="row">
        <div className="col-12 col-md-2">
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <div className="row d-flex justify-content-around">
            <div className="col-12 col-lg-7 order-details">
              <h2 className="my-5">Order # {id}</h2>

              <h4 className="mb-4">Shipping Info</h4>
              <p>
                <b>Name:</b> {user?.name ?? "N/A"}
              </p>
              <p>
                <b>Phone:</b> {shippingInfo?.phoneNo ?? "N/A"}
              </p>
              <p className="mb-4">
                <b>Address:</b> {shippingDetails}
              </p>
              <p>
                <b>Amount:</b> ${totalPrice?.toFixed(2)}
              </p>

              <hr />

              <h4 className="my-4">Payment</h4>
              <p className={isPaid ? "greenColor" : "redColor"}>
                <b>{isPaid ? "PAID" : "NOT PAID"}</b>
              </p>

              <h4 className="my-4">Stripe ID</h4>
              <p>
                <b>{paymentInfo?.id ?? "N/A"}</b>
              </p>

              <h4 className="my-4">Order Status:</h4>
              <p className={isDelivered ? "greenColor" : "redColor"}>
                <b>{orderStatus}</b>
              </p>

              <h4 className="my-4">Order Items:</h4>
              <hr />
              <div className="cart-item my-1">
                {orderItems?.map((item) => (
                  <div key={item.product} className="row my-5">
                    <div className="col-4 col-lg-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        height="45"
                        width="65"
                      />
                    </div>
                    <div className="col-5 col-lg-5">
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                    </div>
                    <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                      <p>${item.price.toFixed(2)}</p>
                    </div>
                    <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                      <p>{item.quantity} x</p>
                    </div>
                  </div>
                ))}
              </div>
              <hr />
            </div>

            <div className="col-12 col-lg-3 mt-5">
              <h4 className="my-4">Update Status</h4>
              <div className="form-group">
                <select
                  className="form-control"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isDelivered} // ✅ disable if already delivered
                >
                  <option value="">Select Status</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <button
                className="btn btn-primary btn-block"
                onClick={submitHandler}
                disabled={isDelivered || !status}
              >
                {isDelivered ? "Already Delivered" : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProcessOrder;
