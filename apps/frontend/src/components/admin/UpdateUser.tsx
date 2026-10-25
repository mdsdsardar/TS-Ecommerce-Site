import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  clearError,
  getUser,
  updateUser,
  updateUserReset,
} from "../../services/authSlice";
import Sidebar from "./Sidebar";
import type { AppDispatch, RootState } from "../../store/store";

const UpdateUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");

  const {
    fetchedUser: user,
    isUpdated,
    error,
  } = useSelector((state: RootState) => state.auth);

  // ✅ Fetch user if not loaded
  useEffect(() => {
    if (!id) return;
    if (!user || user._id !== id) {
      dispatch(getUser(id));
    }
  }, [dispatch, id, user]);

  // ✅ Populate form when user loads
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
    }
  }, [user]);

  // ✅ Handle error and success
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (isUpdated) {
      toast.success("User updated successfully");
      dispatch(updateUserReset());
      navigate("/admin/users");
    }
  }, [dispatch, error, isUpdated, navigate]);

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    dispatch(
      updateUser({
        id,
        formData: { name, email, role }, // ✅ plain object not FormData
      }),
    );
  };

  return (
    <>
      <MetaData title="Update User" />
      <div className="row">
        <div className="col-12 col-md-2">
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <div className="row wrapper">
            <div className="col-10 col-lg-5">
              <form className="shadow-lg" onSubmit={submitHandler}>
                <h1 className="mt-2 mb-5">Update User</h1>

                <div className="form-group">
                  <label htmlFor="name_field">Name</label>
                  <input
                    type="text" // ✅ type="text" not "name"
                    id="name_field"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

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
                  <label htmlFor="role_field">Role</label>
                  <select
                    id="role_field"
                    className="form-control"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn update-btn btn-block mt-4 mb-3"
                  disabled={!name.trim() || !email.trim()}
                >
                  Update
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateUser;
