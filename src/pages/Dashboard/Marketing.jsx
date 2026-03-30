import React from "react";
import { MarketAnouncement } from "../../components/icons";
import { IoChevronForward } from "react-icons/io5";
import { Link } from "react-router-dom";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const Marketing = () => {
  const { tc } = useBatchTranslation();
  
  return (
    <BatchTranslationLoader>
      <div className="bg-white rounded-xl h-[83vh] overflow-y-auto">
        <div className="px-4 py-6">
          <p className="text-2xl text-slate-800 font-semibold">
            {tc('growYourBusiness')}
          </p>
          <p className="text-slate-500">
            {tc('marketingDescription')}
          </p>
        </div>

        <div className="flex flex-col gap-10 my-10 px-4">
          <Link
            to={"/dashboard/marketing/message-blast"}
            className="sm:w-2/3 lg:w-1/2"
          >
            <div className="cursor-pointer flex items-center justify-between  px-6 py-6 border border-slate-200 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059]">
              <div>
                <div className="flex items-center gap-2">
                  <MarketAnouncement />
                  <p className="text-xl text-slate-800">{tc('messageBlast')}</p>
                </div>
                <p className="text-slate-500">
                  {tc('messageBlastDescription')}
                </p>
              </div>
              <IoChevronForward color="#93AFD6" size={20} />
            </div>
          </Link>
          <Link
            to={"/dashboard/marketing/promotions"}
            className="sm:w-2/3 lg:w-1/2"
          >
            <div className="cursor-pointer flex items-center justify-between  px-6 py-6 border border-slate-200 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059]">
              <div>
                <div className="flex items-center gap-2">
                  <MarketAnouncement />
                  <p className="text-xl text-slate-800">{tc('promotions')}</p>
                </div>
                <p className="text-slate-500">
                  {tc('promotionsDescription')}
                </p>
              </div>
              <IoChevronForward color="#93AFD6" size={20} />
            </div>
          </Link>
        </div>
      </div>
    </BatchTranslationLoader>
  );
};

export default Marketing;
