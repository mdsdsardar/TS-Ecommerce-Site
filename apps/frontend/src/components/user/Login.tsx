import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, clearError } from "../../services/authSlice";
import type { AppDispatch, RootState } from "../../store/store";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const redirect = new URLSearchParams(location.search).get("redirect") || "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect, { replace: true });
    }
    if (error) {
      toast.error(error);
      dispatch(clearError()); // ✅ clear error after showing toast
    }
  }, [navigate, isAuthenticated, error, redirect, dispatch]);

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      // ✅ || not &&
      toast.error("Please enter your email and password");
      return;
    }
    dispatch(getAuth({ email, password }));
  };

  if (loading) return <Loader />;

  return (
    <>
      <MetaData title="Login" />
      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form className="shadow-lg" onSubmit={submitHandler}>
            <h1 className="mb-3">Login</h1>
            <div className="form-group">
              <label htmlFor="email_field">Email</label>
              <input
                type="email"
                id="email_field"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password_field">Password</label>
              <input
                type="password"
                id="password_field"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Link to="/password/forgot" className="float-right mb-4">
              Forgot Password?
            </Link>

            <button
              id="login_button"
              type="submit"
              className="btn btn-block py-3"
              disabled={loading}
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>

            <Link to="/register" className="float-right mt-3">
              New User?
            </Link>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
