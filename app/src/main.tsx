import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { useLyraStore } from "./state/store";
import "./styles/global.css";

(window as any).__store = useLyraStore;

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
