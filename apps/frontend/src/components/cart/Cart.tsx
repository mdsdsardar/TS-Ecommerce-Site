import { useDispatch, useSelector } from "react-redux";
import { addItemToCart, removeFromCart } from "../../services/cartSlice";
import MetaData from "../layout/MetaData";
import { Link, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store/store";

export const Cart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state: RootState) => state.cart);

  const removeCartItemHandler = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const increaseQty = (id: string, quantity: number, stock: number) => {
    const newQty = quantity + 1;
    if (newQty > stock) return;
    dispatch(addItemToCart({ id, quantity: newQty }));
  };

  const decreaseQty = (id: string, quantity: number) => {
    const newQty = quantity - 1;
    if (newQty <= 0) return;
    dispatch(addItemToCart({ id, quantity: newQty }));
  };

  const checkoutHandler = () => {
    navigate("/login?redirect=/shipping");
  };

  const totalUnits = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.quantity * item.price, 0)
    .toFixed(2);

  if (cartItems.length === 0) {
    return <h2 className="mt-5">Your cart is empty</h2>;
  }

  return (
    <>
      <MetaData title="Cart Items" />
      <h2 className="mt-5">
        Your Cart:{" "}
        <b>
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
        </b>
      </h2>

      <div className="row d-flex justify-content-between">
        <div className="col-12 col-lg-8">
          {cartItems.map((item) => (
            <div key={item.product}>
              <hr />
              <div className="cart-item">
                <div className="row">
                  <div className="col-4 col-lg-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      height="90"
                      width="115"
                    />
                  </div>

                  <div className="col-5 col-lg-3">
                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                  </div>

                  <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                    <p id="card_item_price">${item.price.toFixed(2)}</p>
                  </div>

                  <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                    <div className="stockCounter d-inline">
                      <span
                        className="btn btn-danger minus"
                        onClick={() => decreaseQty(item.product, item.quantity)}
                      >
                        -
                      </span>
                      <input
                        type="number"
                        className="form-control count d-inline"
                        value={item.quantity}
                        readOnly
                      />
                      <span
                        className="btn btn-primary plus"
                        onClick={() =>
                          increaseQty(item.product, item.quantity, item.stock)
                        }
                      >
                        +
                      </span>
                    </div>
                  </div>

                  <div className="col-4 col-lg-1 mt-4 mt-lg-0">
                    <i
                      id="delete_cart_item"
                      className="fa fa-trash btn btn-danger"
                      onClick={() => removeCartItemHandler(item.product)}
                    />
                  </div>
                </div>
              </div>
              <hr />
            </div>
          ))}
        </div>

        <div className="col-12 col-lg-3 my-4">
          <div id="order_summary">
            <h4>Order Summary</h4>
            <hr />
            <p>
              Subtotal:{" "}
              <span className="order-summary-values">
                {totalUnits} {totalUnits === 1 ? "Unit" : "Units"}
              </span>
            </p>
            <p>
              Est. total:{" "}
              <span className="order-summary-values">${totalPrice}</span>
            </p>
            <hr />
            <button
              id="checkout_btn"
              className="btn btn-primary btn-block"
              onClick={checkoutHandler}
            >
              Check out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
