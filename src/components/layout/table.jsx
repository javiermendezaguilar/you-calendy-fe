import React, { useMemo } from "react";
import {
  Text,
  Button,
  Checkbox,
  Group,
  ActionIcon,
  Box,
  Flex,
  Center,
} from "@mantine/core";
import { FaEye, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { MantineReactTable } from "mantine-react-table";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const AppointmentTable = ({
  appointments,
  selectedAppointments,
  handleSelect,
  onMessageRequest,
  actionButtonText = "Delay Alert",
  actionButtonColor = "#4679FD",
  sortConfig,
  onSort,
}) => {
  const { tc } = useBatchTranslation();
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
            <Text fz="md" c="rgba(50,51,52,1)">
              {row.original.id}
            </Text>
          </Flex>
        ),
        Header: ({ column }) => (
          <Flex align="center" gap="xs">
            <Checkbox
              size="md"
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  const allIds = new Set(appointments.map((a) => a.id));
                  handleSelect(null, allIds, true);
                } else {
                  handleSelect(null, new Set(selectedAppointments), false);
                }
              }}
              checked={
                appointments.length > 0 &&
                appointments.every((a) => selectedAppointments.has(a.id))
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
        size: 160,
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
        accessorKey: "email",
        header: tc('emailAddress'),
        size: 220,
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
                {tc('emailAddress')}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        accessorKey: "phoneNumber",
        header: tc('phoneNumber'),
        size: 160,
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
                {tc('phoneNumber')}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        accessorKey: "date",
        header: tc('appointmentDate'),
        size: 180,
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
                {tc('appointmentDate')}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        accessorKey: "time",
        header: tc('time'),
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
                {tc('time')}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        id: "actions",
        header: tc('action'),
        size: 200,
        enableSorting: false,
        Cell: ({ row }) => (
          <Group spacing={8} position="left" noWrap>
            <Button
              h={40}
              px="md"
              radius="md"
              c="white"
              fz="md"
              fw={400}
              onClick={() => onMessageRequest && onMessageRequest(row.original)}
              className={`!bg-[${actionButtonColor}] !hover:bg-[${
                actionButtonColor === "#4679FD" ? "#3A6AE0" : "#3A6AE0"
              }]`}
            >
              {actionButtonText}
            </Button>
            <ActionIcon
              size={40}
              radius="md"
              className="!bg-[#7D9A4B] !hover:bg-[#6A8838]"
            >
              <FaEye size={18} color="white" />
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
    [
      actionButtonText,
      actionButtonColor,
      onMessageRequest,
      appointments,
      selectedAppointments,
      handleSelect,
      sortConfig,
      onSort,
    ]
  );

  return (
    <div className="w-fit ">
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

export default AppointmentTable;
