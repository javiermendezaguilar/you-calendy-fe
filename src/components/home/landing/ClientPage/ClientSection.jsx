import React, { useRef } from "react";
import { ClientSectionIcon } from "../../../common/Svgs";
import Tick from "../../../../assets/Tick.png";
import Candy from "../../../../assets/hero-candy.png";
import addImage from "../../../../assets/addimage.png";
import { Button } from "@mantine/core";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const ClientSection = () => {
  const solutionItems = [
    "Store haircut history & personal preferences.",
    "Add private notes for each client.",
    "Quick access to client details before appointments.",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="container px-3 sm:px-0"
    >
      <div className="w-full relative">
        <div className="relative">
          <section
            className="relative sm:absolute w-full lg:w-[1002px] h-auto md:h-[540px] 
          top-0 sm:top-10 left-0 bg-[#f8fbff] rounded-xl mb-[600px] sm:mb-0"
          >
            <div className="relative w-[95%] sm:w-[90%] lg:w-[768px] h-auto md:h-[627px] py-4 sm:py-6 md:top-6 md:left-10 px-3 sm:px-4 md:px-0">
              <div className="flex w-[50px] h-[50px] sm:w-[67px] sm:h-[67px] items-center justify-center gap-2.5 p-3.5 bg-[#e9f2ff] rounded-xl">
                <ClientSectionIcon />
              </div>

              <h1 className="relative sm:absolute w-full sm:w-[500px] mt-4 sm:mt-6 sm:top-[68px] left-0 font-outfit font-bold text-[#003366] text-xl sm:text-2xl md:text-3xl tracking-wider leading-normal">
                Clients Struggle To Explain What They Want
              </h1>

              <h2 className="relative sm:absolute mt-4 sm:mt-0 sm:top-[190px] left-0 font-outfit font-medium text-[#556B2F] text-lg sm:text-xl tracking-wide leading-relaxed">
                Solution!
              </h2>

              <div className="block mt-4 space-y-3 sm:space-y-0">
                <div className="block sm:hidden">
                  {solutionItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5">
                      <img
                        src={Tick}
                        alt="Tick"
                        className="h-5 w-5 text-[#556b2f]"
                      />
                      <div className="font-outfit font-light text-[#333333] text-sm tracking-wide leading-relaxed">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block">
                  {solutionItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2.5 absolute left-0 w-max"
                      style={{ top: `${228 + index * 48}px` }}
                    >
                      <img
                        src={Tick}
                        alt="Tick"
                        className="h-6 w-6 text-[#556b2f]"
                      />
                      <div className="font-outfit font-light text-[#333333] text-sm tracking-wide leading-relaxed">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative sm:absolute mt-6 sm:mt-0 sm:top-[390px] font-outfit font-medium text-black text-lg sm:text-xl tracking-wide leading-relaxed flex items-center gap-3">
                <img className="w-3 h-8 sm:h-10" alt="Candy" src={Candy} />
                <span>
                  Understand clients better & deliver perfect results!
                </span>
              </div>

              <Link to="/registration" data-allow-without-login>
                <Button
                  unstyled
                  className="cursor-pointer relative sm:absolute mt-6 sm:mt-0 sm:top-[450px] left-0 bg-[#003366] text-white text-sm sm:text-md rounded-lg font-normal font-outfit tracking-wide leading-relaxed px-5 sm:px-6 py-2 hover:bg-[#002040] transition-colors"
                >
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </section>

          <section className="absolute w-full sm:w-full md:w-[40%] h-auto md:h-[700px] top-[510px] sm:top-[800px] md:top-0 left-[2.5%] sm:left-0 md:left-auto md:right-0 lg:right-0">
            <div className="relative w-full md:w-[689px] h-auto md:h-[700px]">
              <div className="absolute w-full sm:w-[70%] md:w-[460px] h-auto min-h-[450px] sm:min-h-[600px] top-0 md:top-0 sm:left-[30%] bg-white rounded-[20px] sm:rounded-[32px] shadow-lg border-[4px] border-[#d8e1f4]" />

              <div className="absolute w-[85%] sm:w-[85%] md:w-[530px] h-auto sm:h-[120px] top-[-25px] sm:top-[-95px] left-[5%] sm:left-[20%] bg-white rounded-[15px] sm:rounded-[36px] border-2 border-solid border-[#d8e1f4] shadow-lg py-2 sm:py-0">
                <div className="flex flex-col w-full sm:w-[584px] h-auto items-start relative sm:py-0 sm:top-4 px-4 sm:px-6 md:px-0 lg:mx-10 sm:mx-0">
                  <h2 className="relative w-fit mt-0 font-outfit font-semibold text-[#323334] text-md sm:text-xl">
                    Personalize Your Haircut
                  </h2>
                  <p className="relative w-full sm:w-[480px] font-normal text-[#929699] text-sm sm:text-md mb-0 sm:mb-2">
                    Upload reference photos or provide specific instructions for
                    your desired style.
                  </p>
                </div>
              </div>

              <div className="absolute w-[80%] sm:w-[85%] md:w-[400px] h-auto sm:h-[80px] top-[110px] sm:top-[70px] md:top-[40px] left-[5%] sm:left-[20%] bg-white rounded-[15px] sm:rounded-[22px] border border-solid border-[#d8e1f4] shadow-lg flex items-center justify-center py-3 sm:py-4 md:py-0">
                <h3 className="font-medium text-[#323334] text-md sm:text-xl text-center leading-normal font-outfit tracking-normal px-2">
                  Add Reference Photos
                </h3>
              </div>

              <div className="absolute w-[75%] sm:w-[70%] md:w-[308px] h-auto aspect-square sm:h-[254px] top-[170px] sm:top-[160px] left-[5%] sm:left-[35%]">
                <button className="w-full h-[120px] sm:h-[150px] bg-[#1c315e] rounded-[20px] sm:rounded-[37px] border border-dashed border-[#4b71a5] flex items-center justify-center cursor-pointer hover:bg-[#253b6b] transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-auto sm:w-[97px] h-auto sm:h-[54px]">
                      <div className="flex flex-col w-auto sm:w-[98px] items-center gap-[5px]">
                        <img
                          className="relative w-[24px] h-[24px] sm:w-[30px] sm:h-[30px]"
                          alt="Upload icon"
                          src={addImage}
                        />
                        <div className="relative w-fit font-outfit font-medium text-white text-sm text-center">
                          Add Photos
                        </div>
                      </div>
                    </div>
                    <div className="relative w-fit font-outfit font-light text-[#ffffff9e] text-[10px] sm:text-xs tracking-normal leading-[18px]">
                      jpg, .png, .jpeg
                    </div>
                  </div>
                </button>
              </div>

              <div className="absolute w-[80%] sm:w-[85%] md:w-[400px] h-auto sm:h-[80px] top-[310px] sm:top-[360px] left-[5%] sm:left-[20%] bg-white rounded-[15px] sm:rounded-[22px] border border-solid border-[#d8e1f4] shadow-lg flex items-center justify-center py-3 sm:py-4 md:py-0">
                <h3 className="font-medium text-[#323334] text-md sm:text-xl text-center leading-normal font-outfit tracking-normal px-2">
                  Describe your cut in detail
                </h3>
              </div>

              <textarea
                className="absolute w-[80%] sm:w-[85%] md:w-[400px] h-[100px] sm:h-[150px] top-[380px] sm:top-[470px] left-[5%] sm:left-[20%] bg-[#f7f7f7] rounded-[15px] sm:rounded-[22px] border-2 border-solid border-[#dbe4f2] p-3 sm:p-5 font-outfit text-sm sm:text-md resize-none"
                placeholder="Enter detailed instructions for your haircut"
              />
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default ClientSection;
