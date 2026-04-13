import React, { Suspense, lazy } from "react";
import { Home } from "./Home";
import { motion } from "framer-motion";
import LazyFooter from "../../components/home/landing/LazyFooter";

const MotionDiv = motion.div;

const Gallery = lazy(() => import("./Gallery"));

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: "easeInOut" },
};

const Homepage = () => {
  return (
    <div>
      <MotionDiv
        initial="initial"
        animate="animate"
        variants={pageVariants}
        transition={pageVariants.transition}
      >
        <div className="w-full">
          <Home />
        </div>
        <div className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[78%] mx-auto">
          <Suspense fallback={null}>
            <Gallery />
          </Suspense>
        </div>
      </MotionDiv>

      <LazyFooter />
    </div>
  );
};

export default Homepage;
