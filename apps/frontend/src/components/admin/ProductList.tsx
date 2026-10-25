import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../layout/Loader";
import toast from "react-hot-toast";
import { DataGrid, type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import {
  clearProductDetailsErrors,
  clearProductErrors,
  deleteProduct,
  getAdminProducts,
  resetDeleteProduct,
} from "../../services/productSlice";
import Sidebar from "./Sidebar";
import type { AppDispatch, RootState } from "../../store/store";

const ProductsList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, products, totalProducts } = useSelector(
    (state: RootState) => state.products,
  );
  const { error: deleteError, isDeleted } = useSelector(
    (state: RootState) => state.productDetails,
  );

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  useEffect(() => {
    const currentPage = paginationModel.page + 1;
    const resPerPage = paginationModel.pageSize;
    dispatch(getAdminProducts({ resPerPage, currentPage }));

    if (error) {
      toast.error(error);
      dispatch(clearProductErrors());
    }
    if (deleteError) {
      toast.error(deleteError);
      dispatch(clearProductDetailsErrors());
    }
    if (isDeleted) {
      toast.success("Product deleted successfully");
      dispatch(resetDeleteProduct());
      navigate("/admin/products");
    }
  }, [dispatch, paginationModel, error, deleteError, isDeleted, navigate]);

  const deleteProductHandler = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id));
    }
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "price",
      headerName: "Price",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "stock",
      headerName: "Stock",
      flex: 1,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => (        // ✅ highlight out of stock
        <span style={{ color: params.value === 0 ? "red" : "green" }}>
          {params.value as number}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (        // ✅ typed params
        <>
          <Link
            to={`/admin/products/${params.row.id as string}`}
            className="btn btn-primary py-1 px-2"
          >
            <i className="fa fa-pencil" />
          </Link>
          <button
            className="btn btn-danger py-1 px-2 ml-2"
            onClick={() => deleteProductHandler(params.row.id as string)}
          >
            <i className="fa fa-trash" />
          </button>
        </>
      ),
    },
  ];

  const rows = Array.isArray(products)
    ? products.map((product) => ({
        id: product._id,
        name: product.name,
        price: `$${product.price.toFixed(2)}`,
        stock: product.stock,
      }))
    : [];

  return (
    <>
      <MetaData title="All Products" />
      <div className="row">
        <div className="col-12 col-md-2">
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <h1 className="my-5">All Products</h1>
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
                rowCount={totalProducts ?? 0}
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

export default ProductsList;