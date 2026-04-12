import { Button } from "@mantine/core";
import React from "react";
import { Link } from "react-router-dom";
import HeroRibbon from "../../../assets/hero-ribbon.png";
import HeroCandy from "../../../assets/hero-candy.png";
import HeroBarbar from "../../../assets/hero-barber.webp";
import { FaArrowRightLong } from "react-icons/fa6";
import HeroBG from "../../../assets/hero-bg.webp";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const imageVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.6 } },
};

const HeroSection = () => {
  return (
    <div
      className="min-h-screen px-4 md:px-10 lg:px-20 grid md:grid-cols-1 lg:grid-cols-2 items-center gap-4 text-white py-8 md:py-0 md:mt-10"
      style={{
        backgroundImage: `url(${HeroBG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <motion.div
        className="flex flex-col gap-3 md:gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p variants={itemVariants} className="text-2xl sm:text-3xl md:text-5xl flex gap-2 md:gap-4">
          Grow Your{" "}
          <span>
            <img src={HeroCandy} alt="" className="w-3 md:w-4" decoding="async" />
          </span>
        </motion.p>
        <motion.p variants={itemVariants} className="text-3xl sm:text-4xl md:text-6xl font-semibold">Barber Business</motion.p>
        <motion.img variants={itemVariants} src={HeroRibbon} alt="" className="w-full md:w-4/5" decoding="async" />
        <motion.p variants={itemVariants} className="my-4 md:my-6 text-md">
          Simplify bookings, manage clients, track earnings, and attract more
          customers—all in one powerful and easy-to-use app.
        </motion.p>
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 md:gap-4">
          <Link to="/registration">
            <Button
              size="md"
              color="#556B2F"
              className="!border !border-slate-50/20"
              data-allow-without-login
            >
              Get Started for Free
            </Button>
          </Link>
          <Link to="/login" className="flex items-center gap-2">
            Learn More <FaArrowRightLong />
          </Link>
        </motion.div>
      </motion.div>
      <motion.div
        className="hidden lg:flex justify-end items-center"
        variants={imageVariants}
        initial="hidden"
        animate="visible"
      >
        <img
          src={HeroBarbar}
          alt="Barber using Groomnest"
          className="w-5/6"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </motion.div>
    </div>
  );
};

export default HeroSection;
