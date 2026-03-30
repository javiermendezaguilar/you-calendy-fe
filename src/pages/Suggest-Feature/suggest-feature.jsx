import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCreateFeatureSuggestion } from "../../hooks/useFeatureSuggestion";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";

const SuggestFeature = () => {
  const navigate = useNavigate();
  const { mutate, isLoading } = useCreateFeatureSuggestion();
  const { tc } = useBatchTranslation();

  const handleSubmit = (values) => {
    mutate(values, {
      onSuccess: () => {
        navigate(-1);
      },
    });
  };

  const form = useForm({
    initialValues: { title: "", description: "" },

    validate: {
      title: (value) =>
        value.length < 2 ? tc('titleMinLengthError') : null,
      description: (value) =>
        value.length < 2 ? tc('descriptionMinLengthError') : null,
    },
  });

  return (
    <BatchTranslationLoader>
      <main className="h-[83vh] overflow-auto bg-white mx-auto p-4 rounded-[18px]">
        <form onSubmit={form.onSubmit(handleSubmit)} className=" mx-auto">
          <div className="flex flex-col mt-2 sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <p className="text-2xl text-slate-800 font-semibold">
              {tc('suggestFeature')}
            </p>
            <Button type="submit" color="#323334" size="md" px={50} radius={10} loading={isLoading}>
              {tc('submit')}
            </Button>
          </div>
          <div className="text-sm text-slate-400 mb-6 sm:mb-8 md:mb-12">
              {tc('suggestFeatureDescription')}
           </div>

          <div className="space-y-6 sm:space-y-8 w-full md:w-1/2 lg:w-1/3">
            <div>
              <p className="text-[#7184B4] font-light">{tc('featureTitle')}</p>
              <TextInput
                placeholder={tc('writeHere')}
                variant="filled"
                size="md"
                radius={10}
                className="!bg-slate-50"
                {...form.getInputProps("title")}
              />
            </div>

            <div>
              <p className="text-[#7184B4] font-light">{tc('featureDescription')}</p>
              <Textarea
                placeholder={tc('describeHere')}
                rows={7}
                variant="filled"
                size="md"
                radius={10}
                className="!bg-slate-50"
                {...form.getInputProps("description")}
              />
            </div>
          </div>
        </form>
      </main>
    </BatchTranslationLoader>
  );
};

export default SuggestFeature;
