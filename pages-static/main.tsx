import React from "react";
import { hydrateRoot } from "react-dom/client";
import { AetherLanding } from "../app/AetherLanding";
import "../app/globals.css";

hydrateRoot(document.getElementById("root")!,
  <React.StrictMode>
    <AetherLanding />
  </React.StrictMode>,
);
