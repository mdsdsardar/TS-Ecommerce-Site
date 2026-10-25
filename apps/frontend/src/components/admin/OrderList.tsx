import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../layout/Loader";
import toast from "react-hot-toast";
import {
  DataGrid,
  type GridRenderCellParams,
  type GridColDef,
} from "@mui/x-data-grid";
import Sidebar from "./Sidebar";
import {
  allOrders,
  clearError,
  deleteOrder,
  deleteOrderReset,
} from "../../services/orderSlice";
import type { AppDispatch, RootState } from "../../store/store";

const OrderList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, allOrder, totalOrder, isDeleted } = useSelector(
    (state: RootState) => state.order,
  );

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  useEffect(() => {
    const currentPage = paginationModel.page + 1;
    const resPerPage = paginationModel.pageSize;
    dispatch(allOrders({ resPerPage, currentPage }));

    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (isDeleted) {
      toast.success("Order deleted successfully");
      dispatch(deleteOrderReset());
      navigate("/admin/orders");
    }
  }, [dispatch, paginationModel, error, isDeleted, navigate]);

  const deleteOrderHandler = (id: string) => {
    dispatch(deleteOrder(id));
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Order ID",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "numOfItems",
      headerName: "No of Items",
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
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <Link
            to={`/admin/order/${params.row.id as string}`}
            className="btn btn-primary py-1 px-2"
          >
            <i className="fa fa-eye" />
          </Link>
          <button
            className="btn btn-danger py-1 px-2 ml-2"
            onClick={() => deleteOrderHandler(params.row.id as string)}
          >
            <i className="fa fa-trash" />
          </button>
        </>
      ),
    },
  ];

  const rows = Array.isArray(allOrder)
    ? allOrder.map((order) => ({
        id: order._id,
        numOfItems: order.orderItems?.length ?? 0,
        amount: `$${order.totalPrice.toFixed(2)}`,
        status: order.orderStatus,
      }))
    : [];

  return (
    <>
      <MetaData title="All Orders" />
      <div className="row">
        <div className="col-12 col-md-2">
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <h1 className="my-5">All Orders</h1>
          {loading ? (
            <Loader />
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
                rowCount={totalOrder ?? 0}
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

export default OrderList;
