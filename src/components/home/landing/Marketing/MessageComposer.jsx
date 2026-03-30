import { useForm } from "react-hook-form";
import { Paper, Box, Textarea, TextInput, Button, Text, Stack, Group } from '@mantine/core';
import AddImage from "../../../../assets/addimage.png";
import { motion } from "framer-motion";

export function MessageComposer() {
  const { register } = useForm();

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="w-full md:w-[50%] md:pr-0"
    >
      <Paper 
        className="!mt-8 sm:!mt-10 md:!mt-16 lg:!mt-20 !w-full !h-auto md:!h-[580px] !shadow-[0px_100px_150px_-15px_rgba(167,186,201,0.6)] !rounded-[12px] sm:!rounded-[15px] md:!rounded-[21px] !border-[2px] sm:!border-[3px] md:!border-[5px] !border-[#D9E2F4] !bg-white !relative"
        shadow="xl"
        radius="xl"
        withBorder
      >
        <Paper
          className="!text-center !text-[#323334] !text-md sm:!text-base md:!text-2xl !font-medium !w-[80%] sm:!w-[85%] !bg-white !py-1 sm:!py-2 md:!py-6 !h-[50px] sm:!h-[60px] md:!h-[90px] !rounded-[10px] sm:!rounded-[15px] md:!rounded-[22px] !border-[#D9E2F4] !absolute !top-[-30px] sm:!top-[-35px] md:!top-[-70px] !left-[5%] sm:!left-[2%]"
          shadow="md"
          radius="lg"
          withBorder
        >
          <div className="mx-2 sm:mx-4 md:mx-6 flex items-center justify-center h-full">
            Compose Your Message
          </div>
        </Paper>
        <Box className="h-auto md:h-[540px] mt-4 sm:mt-0 w-full !rounded-xl !bg-white !p-2 sm:!p-3 md:!p-[26px] !pt-6 sm:!pt-8 md:!pt-10 overflow-visible">
          <form className="flex w-full flex-col gap-2 sm:gap-2.5 relative">
            <Textarea
              {...register("smsText")}
              placeholder="SMS/Push Text"
              classNames={{
                input: "!h-[70px] sm:!h-[90px] md:!h-[130px] !w-full !resize-none !rounded-lg !border !border-[#F3F3F3] !bg-[#F8F8F8] !p-2 md:!p-3 !text-xs sm:!text-sm !font-normal !leading-[20px] sm:!leading-[25px] !text-[#8E8E8E] focus:!outline-none focus:!ring-2 focus:!ring-[#D9E2F4]"
              }}
            />
            
            <Box className="relative !mt-[-8px] sm:!mt-[-10px] md:!mt-[-15px] !z-10">
              <TextInput
                {...register("emailTitle")}
                placeholder="Email Title"
                classNames={{
                  input: "!h-[40px] sm:!h-[50px] md:!h-[70px] lg:!h-[80px] !w-full !rounded-lg !border !border-[#D9E2F4] !bg-white !text-xs sm:!text-sm !font-medium !text-[#323334] !shadow-md focus:!outline-none focus:!ring-2 focus:!ring-[#D9E2F4]",
                  root: "!w-full"
                }}
              />
            </Box>
            
            <Textarea
              {...register("emailContent")}
              placeholder="Email Content Here"
              autosize
              minRows={3}
              maxRows={6}
              classNames={{
                input: "!h-[90px] sm:!h-[120px] md:!h-[172px] !w-full !resize-none !rounded-lg !border !border-[#D9E2F4] !bg-white !p-2 md:!p-3 !text-xs sm:!text-sm !font-medium !text-[#323334] !shadow-md focus:!outline-none focus:!ring-2 focus:!ring-[#D9E2F4]"
              }}
            />
            
            <Button
              className="!mt-2 sm:!mt-3 md:!mt-5 !h-[60px] sm:!h-[50px] md:!h-[70px] lg:!h-[100px] !w-full !items-center !justify-center !rounded-lg !border !border-[#F3F3F3] !bg-[#1C315E] !transition-colors hover:!bg-[#162548]"
              size="md"
            >
              <Stack align="center" gap={1} className="flex-row items-center sm:flex-col">
                <img className="h-[14px] w-[14px] sm:h-[16px] sm:w-[16px] md:h-[20px] md:w-[20px]" src={AddImage} alt="Add header" />
                <Text className="!text-[10px] sm:!text-xs md:!text-sm !text-white">Add header image</Text>
              </Stack>
            </Button>
          </form>
        </Box>
      </Paper>
    </motion.div>
  );
}

export default MessageComposer;
