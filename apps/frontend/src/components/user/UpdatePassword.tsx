import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  updateUserReset,
  clearError,
  updatePassword,
} from "../../services/userSlice";
import type { AppDispatch, RootState } from "../../store/store";

interface IUpdatePassword {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

const UpdatePassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [oldPassword, setOldPassword] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const { error, isUpdated, loading } = useSelector(
    (state: RootState) => state.user,
  );

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
      return;
    }
    if (isUpdated) {
      toast.success("Password updated successfully");
      dispatch(updateUserReset());
      navigate("/me");
    }
  }, [dispatch, error, isUpdated, navigate]);

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const passwordData: IUpdatePassword = {
      oldPassword,
      password,
      confirmPassword,
    };
    dispatch(updatePassword(passwordData));
  };

  return (
    <>
      <MetaData title="Change Password" />
      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form className="shadow-lg" onSubmit={submitHandler}>
            <h1 className="mt-2 mb-5">Update Password</h1>

            <div className="form-group">
              <label htmlFor="old_password_field">Old Password</label>
              <input
                type="password"
                id="old_password_field"
                className="form-control"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="new_password_field">New Password</label>
              <input
                type="password"
                id="new_password_field"
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
              type="submit"
              className="btn update-btn btn-block mt-4 mb-3"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdatePassword;
