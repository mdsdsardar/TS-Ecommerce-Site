import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  clearProductDetailsErrors,
  newProduct,
  resetUpdateProduct,
} from "../../services/productSlice";
import Sidebar from "./Sidebar";
import type { AppDispatch, RootState } from "../../store/store";

const categories: string[] = [
  "Electronics",
  "Cameras",
  "Laptop",
  "Accessories",
  "Headphones",
  "Food",
  "Books",
  "Clothes/Shoes",
  "Sports",
  "Beauty/Health",
  "Outdoor",
  "Home",
];

const NewProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>(""); // ✅ string not number
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [stock, setStock] = useState<string>(""); // ✅ string not number
  const [seller, setSeller] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);

  const { loading, error, success } = useSelector(
    (state: RootState) => state.productDetails,
  );

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearProductDetailsErrors());
    }
    if (success) {
      toast.success("Product created successfully.");
      dispatch(resetUpdateProduct());
      navigate("/admin/products");
    }
  }, [dispatch, error, success, navigate]);

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    const formData = new FormData();
    formData.set("name", name);
    formData.set("price", price); // ✅ string works with FormData
    formData.set("description", description);
    formData.set("category", category);
    formData.set("stock", stock); // ✅ string works with FormData
    formData.set("seller", seller);
    images.forEach((image) => formData.append("images", image));
    dispatch(newProduct(formData));
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // ✅ Reset previews on new selection
    // setImagesPreview([]);
    // setImages([]);

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagesPreview((prev) => [...prev, reader.result as string]);
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <MetaData title="New Product" />
      <div className="row">
        <div className="col-12 col-md-2">
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <div className="wrapper my-5">
            <form
              className="shadow-lg"
              encType="multipart/form-data"
              onSubmit={submitHandler}
            >
              <h1 className="mb-4">New Product</h1>

              <div className="form-group">
                <label htmlFor="name_field">Name</label>
                <input
                  type="text"
                  id="name_field"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price_field">Price</label>
                <input
                  type="number"
                  id="price_field"
                  className="form-control"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description_field">Description</label>
                <textarea
                  className="form-control"
                  id="description_field"
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category_field">Category</label>
                <select
                  className="form-control"
                  id="category_field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Choose Category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="stock_field">Stock</label>
                <input
                  type="number"
                  id="stock_field"
                  className="form-control"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="seller_field">Seller Name</label>
                <input
                  type="text"
                  id="seller_field"
                  className="form-control"
                  value={seller}
                  onChange={(e) => setSeller(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Images</label>
                <div className="custom-file">
                  <input
                    type="file"
                    name="product_images"
                    className="custom-file-input"
                    id="customFile"
                    onChange={onChange}
                    multiple
                    accept="image/*"
                  />
                  <label className="custom-file-label" htmlFor="customFile">
                    Choose Images
                  </label>
                </div>
                <div className="mt-3">
                  {imagesPreview.map((img, index) => (
                    <img
                      src={img}
                      key={index}
                      alt={`Preview ${index + 1}`}
                      className="mr-2"
                      width="55"
                      height="52"
                    />
                  ))}
                </div>
              </div>

              <button
                id="login_button"
                type="submit"
                className="btn btn-block py-3"
                disabled={loading}
              >
                {loading ? "Creating..." : "CREATE"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewProduct;
