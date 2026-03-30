import { Button, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTicket } from "../../hooks/useSupport";
import { userGetData } from "../../services/hooks";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const TicketForm = () => {
  const navigate = useNavigate();
  const { mutate: createTicket, isLoading } = useCreateTicket();
  const userData = userGetData();
  const { tc } = useBatchTranslation();

  const form = useForm({
    initialValues: {
      title: "",
      issueDescription: "",
    },

    validate: {
      title: (value) => (!value ? tc('enterSubjectError') : null),
      issueDescription: (value) => (!value ? tc('enterDescriptionError') : null),
    },
  });

  const handleSubmit = (values) => {
    createTicket(values, {
      onSuccess: () => {
        navigate("/dashboard/support");
      },
    });
  };

  return (
    <div>
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className="pb-4 px-4 flex flex-col justify-between h-full lg:h-[60vh]"
      >
        <div className=" lg:w-1/2 grid grid-cols-1 gap-6">
          <label>
            <TextInput
              size="sm"
              placeholder={tc('fullName')}
              value={userData?.name || ""}
              readOnly
            />
          </label>
          <label>
            <TextInput
              size="sm"
              placeholder={tc('emailAddress')}
              value={userData?.email || ""}
              readOnly
            />
          </label>

          <label>
            <p className=" mb-2 text-sm">{tc('subject')}</p>
            <TextInput
              size="sm"
              placeholder={tc('enterSubject')}
              {...form.getInputProps("title")}
            />
          </label>

          <label>
            <p className=" mb-2 text-sm">{tc('description')}</p>
            <Textarea
              rows={2}
              placeholder={tc('describeYourIssue')}
              {...form.getInputProps("issueDescription")}
            />
          </label>
          <div className="flex justify-start">
            <Button
              type="submit"
              size="md"
              radius={"md"}
              color="#282828"
              loading={isLoading}
            >
              {tc('create')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;
