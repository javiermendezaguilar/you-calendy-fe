import { Button, Divider, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";
import { IoChevronDownOutline } from "react-icons/io5";

const AssignSale = ({ close }) => {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: { barber: "" },

    validate: {
      barber: (value) => (!value ? "Please select a barber" : null),
    },
  });

  const handleSubmit = (values) => {
    close();
  };

  return (
    <div>
      <p className="text-2xl font-semibold my-6">Assign Sale</p>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <div className="md:flex flex-row items-start gap-4">
          <div>
            <p className="text-[#7184B4] font-light">Item</p>
            <div className="bg-amber-100 px-3 py-2 rounded-xl">
              <p className="text-sm font-medium">Shaved (30)m</p>
              <p className="text-sm font-light">$15.00</p>
            </div>
          </div>
          <div>
            <p className="text-[#7184B4] font-light">Assign to</p>
            <Select
              variant="filled"
              radius={10}
              placeholder="Select"
              size="lg"
              data={[
                "Williamson Bake",
                "John Wood",
                "Alice Doe",
                "Jehvin Bush",
              ]}
              rightSection={<IoChevronDownOutline />}
              {...form.getInputProps("barber")}
            />
          </div>
        </div>
        <Divider my={20} />

        <div className="flex items-center gap-4">
          <Button
            onClick={close}
            radius={10}
            size="md"
            color={"#DBDBDB"}
            className="!text-slate-500 !w-full"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            radius={10}
            size="md"
            color={"#323334"}
            className="!w-full"
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AssignSale;
