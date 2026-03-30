import React, { useMemo, useState } from "react";
import {
  Box,
  Text,
  ActionIcon,
  Flex,
  Checkbox,
  Group,
  Button,
  Menu,
} from "@mantine/core";
import {
  FaEye,
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronDown,
} from "react-icons/fa";
import { ChevronDown } from "tabler-icons-react";
import { MantineReactTable } from "mantine-react-table";
import { useNavigate } from "react-router-dom";
import { useUpdateBarberStatus } from "../../hooks/useAdmin";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

// Separate component for the status button to maintain its own state
const ButtonWithStatus = ({ barber, onUpdateStatus }) => {
  const { tc } = useBatchTranslation();
  const isDeactivated = barber.status === 'deactivated';
  const { mutate: updateStatus, isLoading } = useUpdateBarberStatus();

  const handleStatusChange = (newStatus) => {
    updateStatus({ id: barber._id, status: newStatus });
  };

  return (
    <Menu shadow="md" width={140}>
      <Menu.Target>
        {isDeactivated ? (
          <Button
            size="md"
            style={{
              height: 32,
              width: 120,
              fontSize: 14,
              fontWeight: 500,
              borderRadius: 5,
              backgroundColor: '#FA5252',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 8px 0 12px',
            }}
            className="!bg-[#FA5252] hover:!bg-[#E03131]"
            disabled={isLoading}
          >
            <span>{tc('deactivated')}</span>
            <span style={{ 
              borderLeft: '1px solid #FB7A7A',
              paddingLeft: 6,
              marginLeft: 6,
              display: 'flex',
              alignItems: 'center',
              height: '100%'
            }}>
              <ChevronDown size={16} />
            </span>
          </Button>
        ) : (
          <Button
            size="md"
            style={{
              height: 32,
              width: 110,
              fontSize: 14,
              fontWeight: 500,
              borderRadius: 5,
              backgroundColor: '#1478d3',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 8px 0 12px',
            }}
            className="!bg-[#1478d3] hover:!bg-[#0e61b0]"
            disabled={isLoading}
          >
            <span>{tc('activated')}</span>
            <span style={{ 
              borderLeft: '1px solid #4497e3',
              paddingLeft: 6,
              marginLeft: 6,
              display: 'flex',
              alignItems: 'center',
              height: '100%'
            }}>
              <ChevronDown size={16} />
            </span>
          </Button>
        )}
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item 
          onClick={() => handleStatusChange('activated')}
          disabled={!isDeactivated || isLoading}
        >
          {tc('activate')}
        </Menu.Item>
        <Menu.Item 
          onClick={() => handleStatusChange('deactivated')}
          disabled={isDeactivated || isLoading}
        >
          {tc('deactivate')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

const BarberTable = ({ data, sortConfig, onSort, onDelete }) => {
  const { tc } = useBatchTranslation();
  const [selectedBarbers, setSelectedBarbers] = useState(new Set());
  const navigate = useNavigate();
  // Remove the local delete functionality since we're now using the parent's onDelete
  // const { mutate: deleteBarber, isLoading: isDeleting } = useDeleteBarber();
  const { mutate: updateStatus, isLoading: isUpdatingStatus } = useUpdateBarberStatus();

  const handleDelete = (barber) => {
    if (onDelete) {
      onDelete(barber);
    }
  };

  const handleSelect = (id, idsSet, isSelectAll) => {
    if (isSelectAll === true && idsSet) {
      setSelectedBarbers(new Set([...idsSet]));
      return;
    } else if (isSelectAll === false && idsSet) {
      setSelectedBarbers(new Set());
      return;
    }

    const newSelected = new Set(selectedBarbers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBarbers(newSelected);
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
              checked={selectedBarbers.has(row.original._id)}
              onChange={() => handleSelect(row.original._id)}
              size="md"
            />
            <Text fz="md" fw={400} c="rgba(50,51,52,1)">
              {row.original._id.slice(-6)}
            </Text>
          </Flex>
        ),
        Header: ({ column }) => (
          <Flex align="center" gap="xs">
            <Checkbox
              checked={
                data.length > 0 &&
                data.every((item) => selectedBarbers.has(item._id))
              }
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  const allIds = new Set(data.map((item) => item._id));
                  handleSelect(null, allIds, true);
                } else {
                  handleSelect(null, new Set(selectedBarbers), false);
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
        accessorKey: "name",
        header: tc('barber'),
        size: 140,
        Cell: ({ renderedCellValue }) => (
            <Text fz="md" fw={400} c="rgba(50,51,52,1)" style={{ whiteSpace: 'nowrap' }}>
              {renderedCellValue}
            </Text>
          ),
        Header: ({ column }) => {
            const isSorted = sortConfig?.key === 'name' || sortConfig?.key === column.id;
            const sortDirection = isSorted ? sortConfig.direction : null;
            let Icon = FaSort;
            if (sortDirection === "ascending") Icon = FaSortUp;
            if (sortDirection === "descending") Icon = FaSortDown;
  
            return (
              <Flex
                align="center"
                gap={5}
                onClick={() => onSort && onSort("name")}
                style={{ cursor: "pointer" }}
              >
                <Text c="white" fz="md" fw={500}>
                  {tc('barber')}
                </Text>
                <Icon color="white" size={14} />
              </Flex>
            );
          },
      },
      {
        accessorKey: "email",
        header: tc('emailAddress'),
        size: 150,
        Cell: ({ renderedCellValue }) => (
          <Text fz="md" fw={400} c="rgba(50,51,52,1)">
            {renderedCellValue}
          </Text>
        ),
        Header: ({ column }) => {
          const isSorted = sortConfig?.key === 'email' || sortConfig?.key === column.id;
          const sortDirection = isSorted ? sortConfig.direction : null;
          let Icon = FaSort;
          if (sortDirection === "ascending") Icon = FaSortUp;
          if (sortDirection === "descending") Icon = FaSortDown;

          return (
            <Flex
              align="center"
              gap={5}
              onClick={() => onSort && onSort("email")}
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
        accessorKey: "phone",
        header: tc('phoneNumber'),
        size: 100,
        Cell: ({ renderedCellValue }) => (
            <Text fz="md" fw={400} c="rgba(50,51,52,1)">
              {renderedCellValue}
            </Text>
          ),
        Header: ({ column }) => {
            const isSorted = sortConfig?.key === 'phone' || sortConfig?.key === column.id;
            const sortDirection = isSorted ? sortConfig.direction : null;
            let Icon = FaSort;
            if (sortDirection === "ascending") Icon = FaSortUp;
            if (sortDirection === "descending") Icon = FaSortDown;
  
            return (
              <Flex
                align="center"
                gap={5}
                onClick={() => onSort && onSort("phone")}
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
        accessorKey: "appointments",
        header: tc('appointments'),
        size: 50,
        Cell: ({ row }) => (
          <Text fz="md" fw={400} c="rgba(50,51,52,1)" style={{textAlign:'center'}}>
            {row.original.totalAppointments || 0}
          </Text>
        ),
        Header: ({ column }) => {
          const isSorted = sortConfig?.key === 'appointments' || sortConfig?.key === column.id;
          const sortDirection = isSorted ? sortConfig.direction : null;
          let Icon = FaSort;
          if (sortDirection === "ascending") Icon = FaSortUp;
          if (sortDirection === "descending") Icon = FaSortDown;

          return (
            <Flex
              align="center"
              gap={5}
              onClick={() => onSort && onSort("appointments")}
              style={{ cursor: "pointer", justifyContent: 'center' }}
            >
              <Text c="white" fz="md" fw={500}>
                {tc('appointments')}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        accessorKey: "revenue",
        header: tc('revenue'),
        size: 50,
        Cell: ({ row }) => (
          <Text fz="md" fw={400} c="rgba(50,51,52,1)" style={{textAlign:'center'}}>
            ${row.original.totalRevenue || 0}
          </Text>
        ),
        Header: ({ column }) => {
          const isSorted = sortConfig?.key === 'revenue' || sortConfig?.key === column.id;
          const sortDirection = isSorted ? sortConfig.direction : null;
          let Icon = FaSort;
          if (sortDirection === "ascending") Icon = FaSortUp;
          if (sortDirection === "descending") Icon = FaSortDown;

          return (
            <Flex
              align="center"
              gap={5}
              onClick={() => onSort && onSort("revenue")}
              style={{ cursor: "pointer", justifyContent: 'center' }}
            >
              <Text c="white" fz="md" fw={500}>
                {tc('revenue')}
              </Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        accessorKey: "status",
        header: tc('status'),
        size: 100,
        Cell: ({ row }) => (
          <ButtonWithStatus barber={row.original} />
        ),
        Header: ({ column }) => {
          const isSorted = sortConfig?.key === 'status' || sortConfig?.key === column.id;
          const sortDirection = isSorted ? sortConfig.direction : null;
          let Icon = FaSort;
          if (sortDirection === 'ascending') Icon = FaSortUp;
          if (sortDirection === 'descending') Icon = FaSortDown;
          return (
            <Flex
              align="center"
              gap={5}
              onClick={() => onSort && onSort('status')}
              style={{ cursor: 'pointer' }}
            >
              <Text c="white" fz="md" fw={500}>{tc('status')}</Text>
              <Icon color="white" size={14} />
            </Flex>
          )
        },
      },
      {
        id: "actions",
        header: tc('actions'),
        size: 140,
        Cell: ({ row }) => {
          return (
            <Group spacing={8} noWrap>
              <ActionIcon
                size={40}
                radius="md"
                className="!bg-[#1C7ED6] hover:!bg-[#1971C2]"
                onClick={() => navigate(`/admin/barber-profile/${row.original._id}`)}
              >
                <FaEye size={18} color="white" />
              </ActionIcon>
              <ActionIcon
                size={40}
                radius="md"
                onClick={() => handleDelete(row.original)}
                className="!bg-[#FA5252] hover:!bg-[#E03131]"
              >
                <FaTrash size={18} color="white" />
              </ActionIcon>
            </Group>
          );
        },
        Header: () => (
          <Text c="white" fz="md" fw={500}>
            {tc('actions')}
          </Text>
        ),
      },
    ],
    [data, selectedBarbers, sortConfig, onSort, navigate, onDelete]
  );

  return (
    <div className="w-full overflow-x-auto">
      <MantineReactTable
        columns={columns}
        data={data}
        enableSorting={false}
        enableColumnActions={false}
        enableTopToolbar={false}
        enableBottomToolbar={false}
        enableRowSelection={false}
        enableGlobalFilter={false}
        enableColumnFilters={false}
        enablePagination={false}
        enableMultiSort={false}
        mantineTableProps={{
          verticalSpacing: 0,
          horizontalSpacing: 0,
          highlightOnHover: false,
          withBorder: false,
          withColumnBorders: false,
          className: "!w-full !min-w-max",
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

export default BarberTable;
