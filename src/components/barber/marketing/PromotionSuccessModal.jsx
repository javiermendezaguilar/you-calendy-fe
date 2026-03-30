import { Button } from "@mantine/core";
import React from "react";
import { useBatchTranslation } from "../../../contexts/BatchTranslationContext";

const PromotionSuccessModal = ({ onClose }) => {
  const { tc } = useBatchTranslation();

  return (
    <div className="p-3">
      <p className="text-2xl font-semibold text-center mb-3">
        {tc('promotionCreatedSuccessfully')}
      </p>
      <p className="font-light text-center">
        {tc('wantToOfferSameHappyHoursOnDifferentDay')}
      </p>
      <Button
        color={"#323334"}
        w={"100%"}
        size="md"
        radius={10}
        className="mt-10"
        onClick={onClose}
      >
        {tc('ok')}
      </Button>
    </div>
  );
};

export default PromotionSuccessModal;
