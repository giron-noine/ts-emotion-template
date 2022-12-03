import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Global, css } from "@emotion/react";
import normalize from "normalize.css";

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
    <App />
  </React.StrictMode>
);