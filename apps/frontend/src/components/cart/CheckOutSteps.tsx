import { Link } from "react-router-dom";

interface CheckOutStepsProps {
  shipping?: boolean;
  confirmOrder?: boolean;
  payment?: boolean;
}

const CheckOutSteps = ({
  shipping = false,
  confirmOrder = false,
  payment = false,
}: CheckOutStepsProps) => {
  return (
    <div className="checkout-progress d-flex justify-content-center mt-5">
      {/* Step 1 - Shipping */}
      {shipping ? (
        <Link to="/shipping" className="float-right">
          <div className="triangle2-active" />
          <div className="step active-step">Shipping</div>
          <div className="triangle-active" />
        </Link>
      ) : (
        <span style={{ cursor: "not-allowed", pointerEvents: "none" }}>
          <div className="triangle2-incomplete" />
          <div className="step incomplete">Shipping</div>
          <div className="triangle-incomplete" />
        </span>
      )}

      {/* Step 2 - Confirm Order — only accessible after shipping */}
      {confirmOrder && shipping ? (
        <Link to="/order/confirm" className="float-right">
          <div className="triangle2-active" />
          <div className="step active-step">Confirm Order</div>
          <div className="triangle-active" />
        </Link>
      ) : (
        <span style={{ cursor: "not-allowed", pointerEvents: "none" }}>
          <div className="triangle2-incomplete" />
          <div className="step incomplete">Confirm Order</div>
          <div className="triangle-incomplete" />
        </span>
      )}

      {/* Step 3 - Payment — only accessible after confirmOrder */}
      {payment && confirmOrder && shipping ? (
        <Link to="/payment" className="float-right">
          <div className="triangle2-active" />
          <div className="step active-step">Payment</div>
          <div className="triangle-active" />
        </Link>
      ) : (
        <span style={{ cursor: "not-allowed", pointerEvents: "none" }}>
          <div className="triangle2-incomplete" />
          <div className="step incomplete">Payment</div>
          <div className="triangle-incomplete" />
        </span>
      )}
    </div>
  );
};

export default CheckOutSteps;
