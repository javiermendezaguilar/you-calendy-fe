import React, { useMemo, useState } from "react";
import {
  Text,
  Checkbox,
  Group,
  ActionIcon,
  Flex,
  Badge,
  Center,
} from "@mantine/core";
import { FaSort, FaSortUp, FaSortDown, FaTrash, FaClock } from "react-icons/fa";
import { MantineReactTable } from "mantine-react-table";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const AppointmentHistoryTable = ({
  appointments,
  handleDelete,
  sortConfig,
  onSort,
}) => {
  const { tc } = useBatchTranslation();
  const [selectedAppointments, setSelectedAppointments] = useState(new Set());

  const handleSelect = (id) => {
    const newSelected = new Set(selectedAppointments);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAppointments(newSelected);
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      // Select all
      const allIds = new Set(appointments.map((app) => app.id));
      setSelectedAppointments(allIds);
    } else {
      // Deselect all
      setSelectedAppointments(new Set());
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: tc('id'),
        size: 80,
        enableSorting: false,
        Cell: ({ row }) => (
          <Flex align="center" gap={10} style={{ whiteSpace: "nowrap" }}>
            <Checkbox
              checked={selectedAppointments.has(row.original.id)}
              onChange={() => handleSelect(row.original.id)}
              size="md"
            />
            <Text fz="md" fw={400} c="rgba(50,51,52,1)">
              {row.original.id}
            </Text>
          </Flex>
        ),
        Header: ({ column }) => (
          <Flex align="center" gap="xs">
            <Checkbox
              size="md"
              onChange={(e) => handleSelectAll(e.currentTarget.checked)}
              checked={
                appointments.length > 0 &&
                selectedAppointments.size === appointments.length
              }
              indeterminate={
                selectedAppointments.size > 0 &&
                selectedAppointments.size < appointments.length
              }
            />
            <Text c="white" fz="md" fw={500}>
              {tc('id')}
            </Text>
          </Flex>
        ),
      },
      {
        accessorKey: "clientName",
        header: tc('clientName'),
        size: 130,
        Cell: ({ renderedCellValue }) => (
          <Text fz="md" c="rgba(50,51,52,1)">
            {renderedCellValue}
          </Text>
        ),
        Header: ({ column }) => {
          const isSorted = sortConfig?.key === column.id;
          const sortDirection = isSorted ? sortConfig.direction : null;
          let Icon = FaSort;
          if (sortDirection === "ascending") Icon = FaSortUp;
          if (sortDirection === "descending") Icon = FaSortDown;

          return (
            <Flex
              align="center"
              gap={5}
              onClick={() => onSort && onSort(column.id)}
              style={{ cursor: "pointer" }}
            >
              <Text c="white" fz="md" fw={500}>
                {tc('clientName')}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        accessorKey: "appointmentTime",
        header: tc('appointmentTime'),
        size: 200,
        Cell: ({ row }) => (
          <Flex align="center" gap={8}>
            <Text fz="md" c="rgba(50,51,52,1)">
              {row.original.appointmentTime}
            </Text>
            <Flex align="center" className="items-center">
              <FaClock size={10} className="text-[#8C98A9] mr-[2px]" />
              <Text fw={500}>
                9h
              </Text>
            </Flex>
          </Flex>
        ),
        Header: ({ column }) => {
          const isSorted = sortConfig?.key === column.id;
          const sortDirection = isSorted ? sortConfig.direction : null;
          let Icon = FaSort;
          if (sortDirection === "ascending") Icon = FaSortUp;
          if (sortDirection === "descending") Icon = FaSortDown;

          return (
            <Flex
              align="center"
              gap={5}
              onClick={() => onSort && onSort(column.id)}
              style={{ cursor: "pointer" }}
            >
              <Text c="white" fz="md" fw={500}>
                {tc('appointmentTime')}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        accessorKey: "date",
        header: tc('date'),
        size: 140,
        Cell: ({ renderedCellValue }) => (
          <Text fz="md" c="rgba(50,51,52,1)">
            {renderedCellValue}
          </Text>
        ),
        Header: ({ column }) => {
          const isSorted = sortConfig?.key === column.id;
          const sortDirection = isSorted ? sortConfig.direction : null;
          let Icon = FaSort;
          if (sortDirection === "ascending") Icon = FaSortUp;
          if (sortDirection === "descending") Icon = FaSortDown;

          return (
            <Flex
              align="center"
              gap={5}
              onClick={() => onSort && onSort(column.id)}
              style={{ cursor: "pointer" }}
            >
              <Text c="white" fz="md" fw={500}>
                {tc('date')}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        accessorKey: "duration",
        header: tc('duration'),
        size: 120,
        Cell: ({ renderedCellValue }) => (
          <Text fz="md" c="rgba(50,51,52,1)">
            {renderedCellValue}
          </Text>
        ),
        Header: ({ column }) => {
          const isSorted = sortConfig?.key === column.id;
          const sortDirection = isSorted ? sortConfig.direction : null;
          let Icon = FaSort;
          if (sortDirection === "ascending") Icon = FaSortUp;
          if (sortDirection === "descending") Icon = FaSortDown;

          return (
            <Flex
              align="center"
              gap={5}
              onClick={() => onSort && onSort(column.id)}
              style={{ cursor: "pointer" }}
            >
              <Text c="white" fz="md" fw={500}>
                {tc('duration')}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        accessorKey: "status",
        header: tc('status'),
        size: 120,
        Cell: ({ renderedCellValue }) => (
          <Badge 
            color={renderedCellValue === "Confirmed" ? "green" : "red"}
            variant="light"
            px={10}
            py={10}
            fw={500}
            fz="sm"
            radius="md"
            size="xl"
            sx={{
              backgroundColor: renderedCellValue === "Confirmed" ? "rgba(125, 154, 75, 0.15)" : "rgba(248, 113, 113, 0.15)",
              color: renderedCellValue === "Confirmed" ? "#7D9A4B" : "#F87171",
              textTransform: "none"
            }}
          >
            {renderedCellValue}
          </Badge>
        ),
        Header: ({ column }) => {
          const isSorted = sortConfig?.key === column.id;
          const sortDirection = isSorted ? sortConfig.direction : null;
          let Icon = FaSort;
          if (sortDirection === "ascending") Icon = FaSortUp;
          if (sortDirection === "descending") Icon = FaSortDown;

          return (
            <Flex
              align="center"
              gap={5}
              onClick={() => onSort && onSort(column.id)}
              style={{ cursor: "pointer" }}
            >
              <Text c="white" fz="md" fw={500}>
                {tc('status')}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        id: "actions",
        header: tc('action'),
        size: 100,
        enableSorting: false,
        Cell: ({ row }) => (
          <Group spacing={8} position="left" noWrap>
            <ActionIcon
              size={40}
              radius="md"
              className="!bg-[#EF4B4B] !hover:bg-[#E86060]"
              onClick={() => handleDelete && handleDelete(row.original.id)}
              sx={{
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaTrash size={18} color="white" />
            </ActionIcon>
          </Group>
        ),
        Header: () => (
          <Text c="white" fz="md" fw={500}>
            {tc('action')}
          </Text>
        ),
      },
    ],
    [handleDelete, sortConfig, onSort, appointments, selectedAppointments]
  );

  return (
    <div className="w-fit">
      <MantineReactTable
        columns={columns}
        data={appointments}
        enableRowSelection={false}
        enableColumnActions={false}
        enableGlobalFilter={false}
        enableColumnFilters={false}
        enablePagination={false}
        enableBottomToolbar={false}
        enableTopToolbar={false}
        enableMultiSort={false}
        enableSorting={false}
        mantineTableProps={{
          verticalSpacing: 0,
          horizontalSpacing: 0,
          highlightOnHover: false,
          withBorder: false,
          withColumnBorders: false,
          className: "!w-full !min-w-full !table-fixed",
          sx: {
            "& tr": { borderBottom: "1px solid #F2F2F2" },
            "& td": { borderTop: "none", borderBottom: "none" },
          },
        }}
        mantineTableHeadRowProps={{
          className: "!bg-[#323334]",
        }}
        mantineTableHeadCellProps={{
          className: "!p-4 !border-b-0 !whitespace-nowrap",
        }}
        mantineTableBodyRowProps={{
          className: "!h-[70px]",
        }}
        mantineTableBodyCellProps={{
          className: "!px-4 !py-2 !border-b !border-[#F2F2F2]",
        }}
      />
    </div>
  );
};

export default AppointmentHistoryTable;