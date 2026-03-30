import React, { useState } from "react";
import { FaCircleInfo } from "react-icons/fa6";
import { Button, Tabs } from "@mantine/core";
import PushMessageForm from "../../components/barber/marketing/pushMessageForm";
import { MarketingSvg } from "../../components/icons";
import PushSMSForm from "../../components/barber/marketing/pushSMS";
import { Link } from "react-router-dom";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useSendEmailBlast, useGetRecipientGroups, useSendSMSBlast } from "../../hooks/useMarketing";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";

const MessageBlast = () => {
  const { tc } = useBatchTranslation();
  const [activeTab, setActiveTab] = useState("push-email");
  const [formData, setFormData] = useState(null);
  const sendEmailBlast = useSendEmailBlast();
  const sendSMSBlast = useSendSMSBlast();
  const { data: recipientGroups } = useGetRecipientGroups();

  const handleFormSubmit = (data) => {
    setFormData(data);
    // If we're on SMS tab and this is called from form submission, send immediately
    if (activeTab === "push-sms") {
      // Transform frontend data to match backend API expectations
      const transformedData = {
        content: data.content,
        deliveryType: data.deliveryType || (data.delivery === "now" ? "send_now" : data.delivery === "later" ? "send_later" : "recurring"),
      };
      
      // Include clientIds if provided
      if (data.clientIds && data.clientIds.length > 0) {
        transformedData.clientIds = data.clientIds;
      }
      
      // Only add optional fields based on delivery type
      if (data.delivery === "later" || data.deliveryType === "send_later") {
        if (data.date) {
          transformedData.scheduledDate = new Date(data.date).toISOString().split('T')[0];
        }
        if (data.time) {
          transformedData.scheduledTime = data.time;
        }
      }
      
      if ((data.delivery === "recurring" || data.deliveryType === "recurring") && data.recurringInterval) {
        transformedData.recurringInterval = data.recurringInterval;
      }
      
      console.log('SMS Payload being sent:', transformedData);
       sendSMSBlast.mutate(transformedData);
    }
  };

  const handleSend = () => {
    if (activeTab === "push-email") {
      if (formData) {
        sendEmailBlast.mutate(formData);
      } else {
        // Trigger form validation by attempting to submit the visible form
        const forms = document.querySelectorAll('form');
        const visibleForm = Array.from(forms).find(form => {
          const rect = form.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && form.offsetParent !== null;
        });
        if (visibleForm) {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          visibleForm.dispatchEvent(submitEvent);
        }
      }
    } else if (activeTab === "push-sms") {
      // Always trigger form submission for SMS to ensure validation and proper flow
      const forms = document.querySelectorAll('form');
      const visibleForm = Array.from(forms).find(form => {
        const rect = form.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && form.offsetParent !== null;
      });
      if (visibleForm) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        visibleForm.dispatchEvent(submitEvent);
      }
    }
  };

  return (
    <BatchTranslationLoader>
      <div className="bg-white rounded-xl h-[83vh] p-4 overflow-auto">
        <Link to={"/dashboard/marketing"} className="flex w-auto mb-4">
          <Button
            size="lg"
            className=" sm:!w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200"
          >
            <IoArrowBackCircleOutline
              size={24}
              className="me-2 hidden sm:block"
            />{" "}
            {tc('goBack')}
          </Button>
        </Link>
        <p className="text-2xl text-slate-800 font-semibold">
          {tc('composeYourMessage')}
        </p>
        <div className="grid lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className=" my-5 bg-blue-50 flex items-start gap-2 p-4 rounded-xl">
              <FaCircleInfo color="#00336680" size={24} />
              <p className="text-[#003366d3]">
                {tc('secureMessagingInfo')}
              </p>
            </div>
            <div className="lg:w-5/6">
              <Tabs
                size={"lg"}
                color={"#0D0D0D"}
                variant="pills"
                value={activeTab}
                onChange={setActiveTab}
              >
                <Tabs.List className="!rounded-xl !p-2 !bg-slate-100 !w-fit">
                  <Tabs.Tab className="!px-10" value="push-email">
                    {tc('pushEmail')}
                  </Tabs.Tab>
                  <Tabs.Tab className="!px-10" value="push-sms">
                    {tc('pushSMS')}
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="push-email">
                  <PushMessageForm 
                    onSubmit={handleFormSubmit}
                    recipientGroups={recipientGroups}
                    isLoading={sendEmailBlast.isPending}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="push-sms">
                  <PushSMSForm onSubmit={handleFormSubmit} />
                </Tabs.Panel>
              </Tabs>
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            <MarketingSvg />
          </div>
        </div>
        <div className="flex justify-end mt-30">
          <Button 
            onClick={handleSend}
            color="#323334" 
            size="md" 
            radius={10} 
            px={60}
            loading={activeTab === "push-email" ? sendEmailBlast.isPending : sendSMSBlast.isPending}
          >
            {tc('send')}
          </Button>
        </div>
      </div>
    </BatchTranslationLoader>
  );
};

export default MessageBlast;
