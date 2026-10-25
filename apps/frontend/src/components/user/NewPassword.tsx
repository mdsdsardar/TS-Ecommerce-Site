import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  clearError,
  resetPassword,
  resetSuccess,
} from "../../services/userSlice";
import type { AppDispatch, RootState } from "../../store/store";

export const NewPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { error, success, loading } = useSelector(
    (state: RootState) => state.user,
  );

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
      return;
    }
    if (success) {
      toast.success("Password updated successfully");
      dispatch(resetSuccess()); // ✅ clear success flag after navigating
      navigate("/login");
    }
  }, [dispatch, error, success, navigate]);

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or expired reset token");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    dispatch(resetPassword({ token, password, confirmPassword }));
  };

  return (
    <>
      <MetaData title="New Password Reset" />
      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form className="shadow-lg" onSubmit={submitHandler}>
            <h1 className="mb-3">New Password</h1>
            <div className="form-group">
              <label htmlFor="password_field">Password</label>
              <input
                type="password"
                id="password_field"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm_password_field">Confirm Password</label>
              <input
                type="password"
                id="confirm_password_field"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button
              id="new_password_button"
              type="submit"
              className="btn btn-block py-3"
              disabled={loading}
            >
              {loading ? "Updating..." : "Set Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
