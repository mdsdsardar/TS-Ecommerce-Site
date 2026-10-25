import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import toast from "react-hot-toast";
import {
  clearError,
  forgotPassword,
  clearMessage,
} from "../../services/userSlice";
import type { AppDispatch, RootState } from "../../store/store";

export const ForgotPassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { error, message, loading } = useSelector(
    (state: RootState) => state.user,
  );
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
      return;
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [dispatch, error, message]);

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    dispatch(forgotPassword(email));
  };

  return (
    <div>
      <MetaData title="Forgot Password" />
      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form className="shadow-lg" onSubmit={submitHandler}>
            <h1 className="mb-3">Forgot Password</h1>
            <div className="form-group">
              <label htmlFor="email_field">Enter Email</label>
              <input
                type="email"
                id="email_field"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              id="forgot_password_button"
              type="submit"
              className="btn btn-block py-3"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Email"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
