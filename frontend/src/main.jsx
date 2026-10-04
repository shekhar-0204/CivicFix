import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/layout.css";
import "./styles/premium.css";

import App from "./App.jsx";
import { removeLegacyComplaintData } from "./utils/legacyCleanup";

removeLegacyComplaintData();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);