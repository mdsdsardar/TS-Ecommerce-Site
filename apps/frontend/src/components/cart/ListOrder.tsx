import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import { Link } from "react-router-dom";
import Loader from "../layout/Loader";
import toast from "react-hot-toast";
import { clearError, myOrder } from "../../services/orderSlice";
import {
  DataGrid,
  type GridRenderCellParams,
  type GridColDef,
} from "@mui/x-data-grid";
import type { AppDispatch, RootState } from "../../store/store";

const ListOrders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    loading,
    error,
    order: orders,
  } = useSelector((state: RootState) => state.order);

  useEffect(() => {
    dispatch(myOrder());
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [dispatch, error]);

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Order ID",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "numOfItems",
      headerName: "Num of Items",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <p
          style={{
            color: params.value === "Delivered" ? "green" : "red",
            margin: 0,
          }}
        >
          {params.value as string}
        </p>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Link
          to={`/order/${params.row.id as string}`}
          className="btn btn-primary"
        >
          <i className="fa fa-eye" />
        </Link>
      ),
    },
  ];

  if (loading) return <Loader />;

  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div>
        <MetaData title="My Orders" />
        <h1 className="mt-5">My Orders</h1>
        <p>No orders found.</p>
      </div>
    );
  }

  const rows = orders.map((order) => ({
    id: order._id,
    numOfItems: order.orderItems?.length ?? 0,
    amount: `$${order.totalPrice.toFixed(2)}`,
    status: order.orderStatus,
  }));

  return (
    <>
      <MetaData title="My Orders" />
      <div style={{ width: "100%" }}>
        <h1 className="my-5">My Orders</h1>
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          sx={{
            "& .MuiDataGrid-row": { cursor: "pointer" },
          }}
        />
      </div>
    </>
  );
};

export default ListOrders;
