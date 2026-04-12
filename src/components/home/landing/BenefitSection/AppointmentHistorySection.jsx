import React, { useState } from "react";
import {
  Box,
  Text,
  Paper,
  Checkbox,
  Table,
  Group,
  Avatar,
  Rating,
} from "@mantine/core";
import { IconDiamond } from "@tabler/icons-react";
import profileImage from "../../../../assets/customer.webp";
import haircutPlaceholder from "../../../../assets/haircut.webp";
import { motion } from "framer-motion";

const appointmentsData = [
  {
    id: "001",
    clientName: "Luke Williamson",
    date: "20-Mar-2025",
    avatar: profileImage,
    notes: "Client prefers a classic cut. No special requirements.",
    rating: 4.5,
    haircutImages: [haircutPlaceholder, haircutPlaceholder, haircutPlaceholder],
  },
  {
    id: "002",
    clientName: "Luke Williamson",
    date: "20-Mar-2025",
    avatar: profileImage,
    notes: "Client prefers a classic cut. No special requirements.",
    rating: 5,
    haircutImages: [haircutPlaceholder, haircutPlaceholder, haircutPlaceholder],
  },
  {
    id: "003",
    clientName: "Luke Williamson",
    date: "20-Mar-2025",
    avatar: profileImage,
    notes: "Loves to talk about movies. Mention the latest blockbuster.",
    rating: 4,
    haircutImages: [haircutPlaceholder, haircutPlaceholder, haircutPlaceholder],
  },
  {
    id: "004",
    clientName: "Luke Williamson",
    date: "20-Mar-2025",
    avatar: profileImage,
    notes: "Very particular about the length. Use clippers setting 3.",
    rating: 4.5,
    haircutImages: [haircutPlaceholder, haircutPlaceholder, haircutPlaceholder],
  },
];

const ClientNotes = ({ client }) => {
  if (!client) return null;

  return (
    <Group align="flex-start" mt={10} gap={6} wrap="nowrap">
      <Box className="flex flex-col items-center gap-3">
        <Avatar
          src={client.avatar}
          size={110}
          radius="50%"
          className="border-[6px] border-white"
          style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
        />
        <Paper
          p="sm"
          radius="lg"
          mt={-20}
          className="shadow-sm bg-white"
          style={{ border: "1px solid #E0E7FF" }}
          ta="center"
        >
          <Text size="xs" c="#93AFD6">
            Client Name
          </Text>
          <Text size="sm" fw={500}>
            {client.clientName}
          </Text>
        </Paper>
      </Box>

      <Box style={{ flex: 1 }}>
        <Paper
          className="!bg-[#F4F4F4] !rounded-2xl p-6 pl-8 relative"
          style={{
            borderRadius: "24px",
            border: "1px solid #E0E7FF",
            boxShadow: "0 10px 30px -10px rgba(167, 186, 201, 0.5)",
            paddingTop: "10px",
          }}
        >
          <Paper
            className="!text-[#323334] !text-start !text-lg !font-medium !bg-white py-2 px-5 !rounded-xl !border-[#D9E2F4] !absolute !top-[-20px] !left-[5px]"
            withBorder
          >
            Client Notes
          </Paper>

          <Box className="pt-6">
            <Text size="sm" c="dimmed">
              {client.notes}
            </Text>
            <Group mt="lg" justify="space-between" align="center">
              <Group gap={4}>
                <Text weight={500} c="#5D9C59" fz="sm">
                  Star Rating
                </Text>
                <Rating
                  value={client.rating}
                  fractions={2}
                  readOnly
                  color="#556B2F"
                />
              </Group>
              <Group gap={0}>
                {client.haircutImages.map((img, index) => (
                  <Avatar
                    key={index}
                    src={img}
                    size={50}
                    radius="50%"
                    className="border-2 border-white"
                    style={{ marginLeft: index > 0 ? -20 : 0 }}
                  />
                ))}
              </Group>
            </Group>
          </Box>
        </Paper>
      </Box>
    </Group>
  );
};

const AppointmentHistorySection = () => {
  const [selected, setSelected] = useState(new Set([appointmentsData[0].id]));

  const handleSelect = (id) => {
    const newSelected = new Set();
    if (!selected.has(id)) {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const selectedClient = appointmentsData.find((app) =>
    selected.has(app.id)
  );

  const allSelected = selected.size === appointmentsData.length;
  const handleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(appointmentsData.map((a) => a.id)));
    }
  };

  const rows = appointmentsData.map((element) => (
    <Table.Tr
      key={element.id}
      onClick={() => handleSelect(element.id)}
      style={{
        cursor: "pointer",
        backgroundColor: selected.has(element.id) ? "#F0F4FF" : "white",
      }}
    >
      <Table.Td>
        <Checkbox
          checked={selected.has(element.id)}
          onChange={() => {}}
          readOnly
        />
      </Table.Td>
      <Table.Td>{element.clientName}</Table.Td>
      <Table.Td>{element.date}</Table.Td>
    </Table.Tr>
  ));

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="md:w-2/5 w-full"
    >
      <Box p="md" className="bg-transparent font-sans w-full mt-10 md:mt-0">
      <Paper
        shadow="md"
        radius="xl"
        p="lg"
        style={{
          borderRadius: "28px",
          border: "1.5px solid #E0E7FF",
          boxShadow: "0px 10px 30px -10px rgba(167, 186, 201, 0.18)",
          background: "#fff",
          position: "relative",
          overflow: "visible"
        }}
        className="overflow-visible"
      >
        <Paper
          className="!text-[#323334] !text-lg !font-medium !bg-white py-2 px-5 !rounded-xl !border-[#D9E2F4]"
          withBorder
          style={{
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            border: "1px solid #E0E7FF",
            borderRadius: "18px",
            marginBottom: "-10px",
            marginTop: "-50px",
            width: "fit-content",
            position: "relative",
            zIndex: 2
          }}
        >
          Appointment History
        </Paper>
        <Box style={{ marginTop: "20px" }}>
          <Table verticalSpacing="md" horizontalSpacing="md" withRowBorders>
            <Table.Thead>
              <Table.Tr className="!bg-[#212529] text-white">
                <Table.Th style={{ width: "60px" }}>
                  <Checkbox
                    checked={allSelected}
                    onChange={handleSelectAll}
                    color="dark"
                    styles={{ input: { backgroundColor: '#495057', borderColor: '#495057' } }}
                  />
                </Table.Th>
                <Table.Th className="!text-white">
                  <Group gap={4} align="center">
                    Client Name <IconDiamond size={12} color="#868e96" />
                  </Group>
                </Table.Th>
                <Table.Th className="!text-white">
                  <Group gap={4} align="center">
                    Date <IconDiamond size={12} color="#868e96" />
                  </Group>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Box>
      </Paper>
      <ClientNotes client={selectedClient} />
    </Box>
    </motion.div>
  );
};

export default AppointmentHistorySection;
