import React from "react";
import ReactDOM from "react-dom/client";
import { Global, css } from "@emotion/react";
import normalize from "normalize.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import OtherPage from "./pages/otherPage";

const styles = css`
  ${normalize}
  body {
    /* global style write here */
    background-color: gray;
  }
`;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* css reset */}
    <Global styles={styles} />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/other" element={<OtherPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
