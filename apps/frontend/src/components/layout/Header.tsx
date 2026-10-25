import Search from "./Search";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { logoutUser } from "../../services/authSlice";
import type { AppDispatch, RootState } from "../../store/store";

const Header = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const { cartItems } = useSelector((state: RootState) => state.cart);

  const logoutHandler = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => toast.success("Logged out successfully"))
      .catch(() => toast.error("Logout failed, please try again"));
  };

  return (
    <nav className="navbar row">
      <div className="col-12 col-md-3">
        <div className="navbar-brand">
          <Link to="/">
            <img src="/images/logo.png" alt="ShopIT Logo" />
          </Link>
        </div>
      </div>

      <div className="col-12 col-md-6 mt-2 mt-md-0">
        <Search />
      </div>

      <div className="col-12 col-md-3 mt-4 mt-md-0 text-center">
        <Link to="/cart" style={{ textDecoration: "none" }}>
          <span id="cart" className="ml-3">
            Cart
          </span>
          <span className="ml-1" id="cart_count">
            {cartItems.length}
          </span>
        </Link>

        {user ? (
          <div className="ml-4 dropdown d-inline">
            <Link
              to="#!"
              className="btn dropdown-toggle text-white mr-4"
              id="dropDownMenuButton"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <figure className="avatar avatar-nav">
                <img
                  src={user.avatar?.url}
                  alt={user.name}
                  className="rounded-circle"
                />
              </figure>
              <span>{user.name}</span>
            </Link>

            <div
              className="dropdown-menu mt-2"
              aria-labelledby="dropDownMenuButton"
            >
              {user.role !== "admin" ? (
                <Link className="dropdown-item" to="/orders/me">
                  Orders
                </Link>
              ) : (
                <Link className="dropdown-item" to="/dashboard">
                  Dashboard
                </Link>
              )}
              <Link className="dropdown-item" to="/me">
                Profile
              </Link>
              <Link
                className="dropdown-item text-danger"
                to="/"
                onClick={logoutHandler}
              >
                Logout
              </Link>
            </div>
          </div>
        ) : (
          !loading && (
            <Link to="/login" className="btn ml-4" id="login_btn">
              Login
            </Link>
          )
        )}
      </div>
    </nav>
  );
};

export default Header;
