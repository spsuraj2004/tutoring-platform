import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import AssignmentProvider from "./context/AssignmentContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AssignmentProvider>
      <App />
    </AssignmentProvider>
  </React.StrictMode>
);