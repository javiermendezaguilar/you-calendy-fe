import React, { Suspense, lazy } from "react";

const Footer = lazy(() => import("./Footer"));

const LazyFooter = () => (
  <Suspense fallback={null}>
    <Footer />
  </Suspense>
);

export default LazyFooter;
