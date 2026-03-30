import React from "react";
import TicketForm from "../../components/support/ticketForm";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const CreateTicket = () => {
  const { tc } = useBatchTranslation();
  
  return (
    <div className="h-full md:h-[76vh] bg-white rounded-xl border border-slate-200 shadow">
      <div className=" p-6">
        <p className="text-2xl text-slate-800 font-semibold">{tc('createNewTicket')}</p>
        <p className="text-slate-400 font-light">
          {tc('submitRequestGetSupport')}
        </p>
      </div>
      <TicketForm />
    </div>
  );
};

export default CreateTicket;
