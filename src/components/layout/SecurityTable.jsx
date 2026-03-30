import React, { useMemo } from 'react';
import { Flex, Checkbox, Button, Text, Box } from '@mantine/core';
import { MantineReactTable } from 'mantine-react-table';
import { FaSort, FaSortUp, FaSortDown, FaTrash } from 'react-icons/fa';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';

const SecurityTable = ({
  data,
  handleDelete,
  sortConfig,
  onSort,
  selectedRows,
  onSelectAll,
  onRowSelect,
}) => {
  const { tc } = useBatchTranslation();
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: tc('id'),
        size: 80,
        Header: () => (
          <Flex align="center" gap="xs">
            <Checkbox
              checked={data.length > 0 && selectedRows.length === data.length}
              indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
              onChange={(e) => onSelectAll(e.currentTarget.checked)}
              size="md"
            />
            <Text c="white" fz="md" fw={500}>{tc('id')}</Text>
          </Flex>
        ),
        Cell: ({ row }) => (
          <Flex align="center" gap={10} style={{ whiteSpace: 'nowrap' }}>
            <Checkbox
              checked={selectedRows.includes(row.original.id)}
              onChange={(event) => onRowSelect(row.original.id, event.currentTarget.checked)}
              size="md"
            />
            <Text fz="md" fw={400} c="rgba(50,51,52,1)">{row.original.displayId || row.original.id}</Text>
          </Flex>
        ),
      },
      {
        accessorKey: 'date',
        header: tc('date'),
        size: 100,
        Header: () => {
          const isSorted = sortConfig?.key === 'date';
          const sortDirection = isSorted ? sortConfig.direction : null;
          let Icon = FaSort;
          if (sortDirection === 'ascending') Icon = FaSortUp;
          if (sortDirection === 'descending') Icon = FaSortDown;
          return (
            <Flex align="center" gap={5} onClick={() => onSort('date')} style={{ cursor: 'pointer' }}>
              <Text c="white" fz="md" fw={500}>{tc('date')}</Text>
              <Icon color="white" size={14} />
            </Flex>
          );
        },
      },
      {
        accessorKey: 'user',
        header: tc('users'),
        size: 200,
        Header: () => {
            const isSorted = sortConfig?.key === 'user';
            const sortDirection = isSorted ? sortConfig.direction : null;
            let Icon = FaSort;
            if (sortDirection === 'ascending') Icon = FaSortUp;
            if (sortDirection === 'descending') Icon = FaSortDown;
            return (
              <Flex align="center" gap={5} onClick={() => onSort('user')} style={{ cursor: 'pointer' }}>
                <Text c="white" fz="md" fw={500}>{tc('users')}</Text>
                <Icon color="white" size={14} />
              </Flex>
            );
        },
      },
      {
        accessorKey: 'action',
        header: tc('action'),
        size: 380,
        Header: () => {
            const isSorted = sortConfig?.key === 'action';
            const sortDirection = isSorted ? sortConfig.direction : null;
            let Icon = FaSort;
            if (sortDirection === 'ascending') Icon = FaSortUp;
            if (sortDirection === 'descending') Icon = FaSortDown;
            return (
              <Flex align="center" gap={5} onClick={() => onSort('action')} style={{ cursor: 'pointer' }}>
                <Text c="white" fz="md" fw={500}>{tc('action')}</Text>
                <Icon color="white" size={14} />
              </Flex>
            );
        },
        Cell: ({ row }) => (
            <Flex
              justify="space-between"
              align="center"
              direction="row"
              w={"100%"}
              gap="sm"
            >
                <Box className="flex-1 min-w-0 pr-2">
                  <Text>{row.original.action}</Text>
                </Box>
                <Button
                    h={40}
                    px="md"
                    radius="md"
                    c="white"
                    fz="md"
                    fw={400}
                    className="!bg-[#FA5252] hover:!bg-[#e04a4a] w-28 lg:w-auto"
                    onClick={() => handleDelete(row.original.id)}
                    leftSection={<FaTrash size={14} />}
                >
                    {tc('delete')}
                </Button>
            </Flex>
        ),
      },
    ],
    [data, selectedRows, sortConfig, onSort, handleDelete, onSelectAll, onRowSelect]
  );

  return (
    <div>
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
          className: "!w-full table-auto lg:!table-fixed",
          sx: {
            "& tr": { borderBottom: "1px solid #F2F2F2" },
            "& td": { borderTop: "none", borderBottom: "none" },
          },
        }}
        mantineTableHeadRowProps={{
          className: "!bg-[#323334]",
        }}
        mantineTableHeadCellProps={{
          className: "!p-4 !border-b-0 whitespace-normal lg:!whitespace-nowrap",
          style: {
            backgroundColor: 'rgba(50, 51, 52, 1)',
            color: 'white',
          },
        }}
        mantineTableBodyRowProps={{
          className: "!h-[70px]",
        }}
        mantineTableBodyCellProps={{
          className: "!px-4 !py-2 !border-b !border-[#F2F2F2] whitespace-normal break-words lg:!whitespace-nowrap align-top",
          style: {
            borderBottom: '1px solid #E0E0E0', 
          }
        }}
      />
    </div>
  );
};

export default SecurityTable;