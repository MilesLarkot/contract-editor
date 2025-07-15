"use client";

import { useEffect } from "react";
import { scan } from "react-scan";

export default function ReactScanProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      scan({
        showToolbar: true,
        animationSpeed: "slow",
      });
    }
  }, []);

  return null;
}
