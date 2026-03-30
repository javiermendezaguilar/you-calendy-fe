import React, { useMemo, useState } from "react";
import {
  Box,
  Text,
  ActionIcon,
  Flex,
  Badge,
  Checkbox,
  Group,
  Center,
} from "@mantine/core";
import {
  FaEdit,
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaClock,
} from "react-icons/fa";
import { MantineReactTable } from "mantine-react-table";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const StaffTable = ({ 
  staffData = [],
  handleEdit,
  handleDelete,
  sortConfig,
  handleSort,
  formatWorkingHours,
  calculateTotalHours,
}) => {
  const { tc } = useBatchTranslation();
  const [selectedStaff, setSelectedStaff] = useState(new Set());

  const handleSelect = (id, idsSet, isSelectAll) => {
    if (isSelectAll === true && idsSet) {
      setSelectedStaff(new Set([...idsSet]));
      return;
    } else if (isSelectAll === false && idsSet) {
      setSelectedStaff(new Set());
      return;
    }

    const newSelected = new Set(selectedStaff);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStaff(newSelected);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: tc('id'),
        size: 100,
        enableSorting: false,
        Cell: ({ row }) => (
          <Flex align="center" gap={10} style={{ whiteSpace: "nowrap" }}>
            <Checkbox
              checked={selectedStaff.has(row.original._id)}
              onChange={() => handleSelect(row.original._id)}
              size="md"
            />
            <Text fz="md" fw={400} c="rgba(50,51,52,1)">
              {`...${row.original._id.slice(-4)}`}
            </Text>
          </Flex>
        ),
        Header: ({ column }) => (
          <Flex align="center" gap="xs">
            <Checkbox
              checked={
                staffData.length > 0 &&
                staffData.every((item) => selectedStaff.has(item._id))
              }
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  const allIds = new Set(staffData.map((item) => item._id));
                  handleSelect(null, allIds, true);
                } else {
                  handleSelect(null, new Set(selectedStaff), false);
                }
              }}
              size="md"
            />
            <Text c="white" fz="md" fw={500}>
              {tc('id')}
            </Text>
          </Flex>
        ),
      },
      {
        accessorKey: "firstName",
        header: tc('memberName'),
        size: 150,
        Cell: ({ row }) => (
          <Text fz="md" fw={400} c="rgba(50,51,52,1)">
            {`${row.original.firstName} ${row.original.lastName}`}
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
              onClick={() => handleSort && handleSort(column.id)}
              style={{ cursor: "pointer" }}
            >
              <Text c="white" fz="md" fw={500}>
                {tc('memberName')}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        accessorKey: "email",
        header: tc('emailAddress'),
        size: 230,
        Cell: ({ renderedCellValue }) => (
          <Text fz="md" fw={400} c="rgba(50,51,52,1)">
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
              onClick={() => handleSort && handleSort(column.id)}
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
        accessorKey: "workingHours",
        header: tc('workingHours'),
        size: 230,
        Cell: ({ row }) => (
          <Flex align="center">
            <Text fz="md" fw={400} c="rgba(50,51,52,1)">
              {formatWorkingHours(row.original.workingHours)}
            </Text>
            <Flex align="center" className="items-center ml-2">
              <FaClock size={10} className="text-[#8C98A9] mr-[2px]" />
              <Text className="text-[#8C98A9] text-[9px]" fw={500}>
                {calculateTotalHours(row.original.workingHours)}
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
              onClick={() => handleSort && handleSort(column.id)}
              style={{ cursor: "pointer" }}
            >
              <Text c="white" fz="md" fw={500}>
                {tc('workingHours')}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        accessorKey: "role",
        header: tc('staffer'),
        size: 120,
        Cell: ({ renderedCellValue }) => (
          <Text fz="md" fw={400} c="rgba(50,51,52,1)">
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
              onClick={() => handleSort && handleSort(column.id)}
              style={{ cursor: "pointer" }}
            >
              <Text c="white" fz="md" fw={500}>
                {tc('staffer')}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        accessorKey: "position",
        header: tc('position'),
        size: 140,
        Cell: ({ renderedCellValue }) => (
          <Text fz="md" fw={400} c="rgba(50,51,52,1)">
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
              onClick={() => handleSort && handleSort(column.id)}
              style={{ cursor: "pointer" }}
            >
              <Text c="white" fz="md" fw={500}>
                {tc('position')}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        accessorKey: "bookingBuffer",
        header: tc('bookingBuffer') || 'Booking Buffer',
        size: 160,
        Cell: ({ row }) => (
          <Text fz="md" fw={400} c="rgba(50,51,52,1)">
            {typeof row.original.bookingBuffer === 'number'
              ? `${row.original.bookingBuffer} ${tc('minutes') || 'min'}`
              : tc('notSet')}
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
              onClick={() => handleSort && handleSort(column.id)}
              style={{ cursor: "pointer" }}
            >
              <Text c="white" fz="md" fw={500}>
                {tc('bookingBuffer') || 'Booking Buffer'}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        id: "actions",
        header: tc('action'),
        size: 140,
        enableSorting: false,
        Cell: ({ row }) => (
          <Group spacing={8} position="left" noWrap>
            <ActionIcon
              onClick={() => handleEdit?.(row.original)}
              variant="filled"
              color="blue"
              size={40}
              radius="md"
              className="!bg-[#4679FD] hover:!bg-[#2D62F5]"
            >
              <FaEdit size={18} color="white" />
            </ActionIcon>
            <ActionIcon
              onClick={() => handleDelete?.(row.original)}
              variant="filled"
              color="red"
              size={40}
              radius="md"
              className="!bg-[#EF4B4B] hover:!bg-[#D32F2F]"
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
    [staffData, selectedStaff, sortConfig, handleSort, handleDelete, handleEdit, formatWorkingHours, calculateTotalHours]
  );

  return (
    <div className="w-fit ">
      <MantineReactTable
        columns={columns}
        data={staffData}
        enableRowSelection={false}
        enableColumnActions={false}
        enableGlobalFilter={false}
        enableColumnFilters={false}
        enablePagination={false}
        enableBottomToolbar={false}
        enableTopToolbar={false}
        enableMultiSort={false}
        enableSorting={false}
        withBorder={false}
        mantineTableProps={{
          verticalSpacing: 0,
          horizontalSpacing: 0,
          highlightOnHover: false,
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

export default StaffTable;
