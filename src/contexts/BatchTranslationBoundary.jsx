import React from "react";
import { BatchTranslationProvider } from "./BatchTranslationContext.jsx";

export default function BatchTranslationBoundary({ children }) {
  return <BatchTranslationProvider>{children}</BatchTranslationProvider>;
}
