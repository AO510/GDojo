import React from "react";
import ReactDOM from "react-dom/client"; // 注意: 'react-dom' ではなく 'react-dom/client'

import "./index.css";
import App from "./App";

// createRoot を使用
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
