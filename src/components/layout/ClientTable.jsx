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
  Badge,
  Tooltip,
} from "@mantine/core";
import {
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronDown,
  FaEye,
  FaStickyNote,
  FaPaperPlane,
} from "react-icons/fa";
import { ChevronDown } from "tabler-icons-react";
import { MantineReactTable } from "mantine-react-table";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

// Separate component for the status button to maintain its own state
const ButtonWithStatus = ({ client, onStatusUpdate }) => {
  const { tc } = useBatchTranslation();
  const [status, setStatus] = useState(client?.status || 'inactive');
  const isDeactivated = status === 'deactivated' || status === 'inactive';

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (onStatusUpdate) {
      onStatusUpdate({ id: client.id, status: newStatus });
    }
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
          disabled={!isDeactivated}
        >
          {tc('activate')}
        </Menu.Item>
        <Menu.Item 
          onClick={() => handleStatusChange('deactivated')}
          disabled={isDeactivated}
        >
          {tc('deactivate')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

const ClientTable = ({ data, handleDelete, sortConfig, onSort, onView, onStatusUpdate, onResendInvitation }) => {
  const [selectedClients, setSelectedClients] = useState(new Set());

  const handleSelect = (id, idsSet, isSelectAll) => {
    if (isSelectAll === true && idsSet) {
      setSelectedClients(new Set([...idsSet]));
      return;
    } else if (isSelectAll === false && idsSet) {
      setSelectedClients(new Set());
      return;
    }

    const newSelected = new Set(selectedClients);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedClients(newSelected);
  };

  const { tc } = useBatchTranslation();

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: tc('idLabel'),
        size: 120,
        enableSorting: false,
        Cell: ({ row }) => (
          <Flex align="center" gap={10} style={{ whiteSpace: "nowrap" }}>
            <Checkbox
              checked={selectedClients.has(row.original.id)}
              onChange={() => handleSelect(row.original.id)}
              size="md"
            />
            <Text fz="md" fw={400} c="rgba(50,51,52,1)">
              {row.original.id.slice(0, 5)}
            </Text>
          </Flex>
        ),
        Header: ({ column }) => (
          <Flex align="center" gap="xs">
            <Checkbox
              checked={
                data.length > 0 &&
                data.every((item) => selectedClients.has(item.id))
              }
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  const allIds = new Set(data.map((item) => item.id));
                  handleSelect(null, allIds, true);
                } else {
                  handleSelect(null, new Set(selectedClients), false);
                }
              }}
              size="md"
            />
            <Text c="white" fz="md" fw={500}>
              {tc('idLabel')}
            </Text>
          </Flex>
        ),
      },
      {
        accessorKey: "name",
        header: tc('clientName'),
        size: 150,
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
        size: 260,
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
        accessorKey: "status",
        header: tc('status'),
        size: 150,
        Cell: ({ row }) => (
          <ButtonWithStatus client={row.original} onStatusUpdate={onStatusUpdate} />
        ),
        Header: ({ column }) => {
          const isSorted = sortConfig?.key === column.id;
          const sortDirection = isSorted ? sortConfig.direction : null;
          let Icon = FaSort;
          if (sortDirection === 'ascending') Icon = FaSortUp;
          if (sortDirection === 'descending') Icon = FaSortDown;
          return (
            <Flex
              align="center"
              gap={5}
              onClick={() => onSort && onSort(column.id)}
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
        size: 320,
        Cell: ({ row }) => (
          <Group spacing="xs">
            <Button
              variant="filled"
              c='white'
              bg='#738B4A'
              size="xs"
              onClick={() => onView(row.original)}
              leftIcon={<FaEye size={12} />}
            >
              {tc('view')}
            </Button>
            <Button
              color="red"
              size="xs"
              onClick={() => handleDelete(row.original.id)}
              leftIcon={<FaTrash size={12} />}
            >
              {tc('delete')}
            </Button>
            {!row.original.isProfileComplete && onResendInvitation && (
              <Tooltip label={tc('resendInvitationSMS')}>
                <Button
                  variant="filled"
                  color="blue"
                  size="xs"
                  onClick={() => onResendInvitation(row.original.id)}
                  leftIcon={<FaPaperPlane size={12} />}
                >
                  {tc('resend')}
                </Button>
              </Tooltip>
            )}
          </Group>
        ),
        Header: () => <Text c="white" fz="md" fw={500}>{tc('actions')}</Text>,
      },
    ],
    [data, selectedClients, sortConfig, onSort, handleDelete, onView, tc]
  );
  
  return (
    <div className="w-fit">
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
          style: {
            backgroundColor: 'rgba(50, 51, 52, 1)',
            color: 'white',
          },
        }}
        mantineTableBodyRowProps={{
          className: "!h-[70px]",
        }}
        mantineTableBodyCellProps={{
          className: "!px-4 !py-2 !border-b !border-[#F2F2F2]",
          style: {
            borderBottom: '1px solid #E0E0E0', 
          }
        }}
      />
    </div>
  );
};

export default ClientTable;