import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../layout/Loader";
import toast from "react-hot-toast";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import Sidebar from "./Sidebar";
import {
  allUsers,
  clearError,
  deleteUser,
  deleteUserReset,
} from "../../services/authSlice";
import type { AppDispatch, RootState } from "../../store/store";

const UserList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    usersLoading: loading,
    error,
    allUser,
    isDeleted,
    totalUsers,
  } = useSelector((state: RootState) => state.auth);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  useEffect(() => {
    const currentPage = paginationModel.page + 1;
    const resPerPage = paginationModel.pageSize;
    dispatch(allUsers({ resPerPage, currentPage }));

    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (isDeleted) {
      toast.success("User deleted successfully");
      dispatch(deleteUserReset());
      navigate("/admin/users");
    }
  }, [dispatch, paginationModel, error, isDeleted, navigate]);

  const deleteUserHandler = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(id));
    }
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "User ID",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      minWidth: 100,
      renderCell: (
        params: GridRenderCellParams, // ✅ highlight role
      ) => (
        <span style={{ color: params.value === "admin" ? "green" : "blue" }}>
          {params.value as string}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (
        params: GridRenderCellParams, // ✅ typed params
      ) => (
        <>
          <Link
            to={`/admin/user/${params.row.id as string}`}
            className="btn btn-primary py-1 px-2"
          >
            <i className="fa fa-pencil" />
          </Link>
          <button
            className="btn btn-danger py-1 px-2 ml-2"
            onClick={() => deleteUserHandler(params.row.id as string)}
          >
            <i className="fa fa-trash" />
          </button>
        </>
      ),
    },
  ];

  const rows = Array.isArray(allUser)
    ? allUser.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }))
    : [];

  return (
    <>
      <MetaData title="All Users" />
      <div className="row">
        <div className="col-12 col-md-2">
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <h1 className="my-5">All Users</h1>
          {loading ? (
            <Loader />
          ) : rows.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div style={{ width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                autoHeight
                pageSizeOptions={[5, 10, 25]}
                paginationMode="server"
                rowCount={totalUsers ?? 0}
                disableRowSelectionOnClick
                sx={{
                  "& .MuiDataGrid-row": { cursor: "pointer" },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserList;
