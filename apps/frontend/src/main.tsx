import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import store from "./store/store.ts";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 5000,
      }}
    />
  </Provider>,
);
