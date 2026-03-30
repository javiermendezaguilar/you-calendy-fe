import React from "react";
import Footer from "../../components/home/landing/Footer";
import { Home } from "./Home";
import Gallery from "./Gallery";
import { motion } from "framer-motion";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: "easeInOut" },
};

const Homepage = () => {
  const { tc } = useBatchTranslation();
  



  return (
    <div>
      <motion.div
        initial="initial"
        animate="animate"
        variants={pageVariants}
        transition={pageVariants.transition}
      >
        <div className="w-full">
          <Home />
        </div>
        <div className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[78%] mx-auto">
          <Gallery />
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Homepage;
