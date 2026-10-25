import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import { useNavigate } from "react-router-dom";
import { countries } from "countries-list";
import { saveShippingInfo } from "../../services/cartSlice";
import CheckOutSteps from "./CheckOutSteps";
import type { AppDispatch, RootState } from "../../store/store";

const Shipping = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { shippingInfo } = useSelector((state: RootState) => state.cart);

  const [address, setAddress] = useState<string>(shippingInfo.address ?? "");
  const [city, setCity] = useState<string>(shippingInfo.city ?? "");
  const [postalCode, setPostalCode] = useState<string>(
    shippingInfo.postalCode ?? "",
  );
  const [phoneNo, setPhoneNo] = useState<string>(shippingInfo.phoneNo ?? "");
  const [country, setCountry] = useState<string>(shippingInfo.country ?? "");

  // ✅ Sorted alphabetically for better UX
  const countriesList = Object.values(countries).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(
      saveShippingInfo({
        address,
        city,
        phoneNo,
        postalCode,
        country,
      }),
    );
    navigate("/order/confirm");
  };

  return (
    <>
      <MetaData title="Shipping Info" />
      <CheckOutSteps shipping />

      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form className="shadow-lg" onSubmit={submitHandler}>
            <h1 className="mb-4">Shipping Info</h1>

            <div className="form-group">
              <label htmlFor="address_field">Address</label>
              <input
                type="text"
                id="address_field"
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="city_field">City</label>
              <input
                type="text"
                id="city_field"
                className="form-control"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone_field">Phone No</label>
              <input
                type="tel"
                id="phone_field"
                className="form-control"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="postal_code_field">Postal Code</label>
              <input
                type="text"
                id="postal_code_field"
                className="form-control"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="country_field">Country</label>
              <select
                id="country_field"
                className="form-control"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              >
                <option value="">Select a country</option>
                {countriesList.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              id="shipping_btn"
              type="submit"
              className="btn btn-block py-3"
            >
              CONTINUE
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Shipping;
