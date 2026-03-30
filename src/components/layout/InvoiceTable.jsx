import React, { useMemo, useState } from "react";
import {
  Box,
  Text,
  Flex,
  Checkbox,
  Button,
} from "@mantine/core";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaDownload
} from "react-icons/fa";
import { MantineReactTable } from "mantine-react-table";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const InvoiceTable = ({ data, sortConfig, onSort, onDownload }) => {
  const { tc } = useBatchTranslation();
  const [selectedInvoices, setSelectedInvoices] = useState(new Set());

  const handleSelect = (id, idsSet, isSelectAll) => {
    if (isSelectAll === true && idsSet) {
        setSelectedInvoices(new Set([...idsSet]));
      return;
    } else if (isSelectAll === false && idsSet) {
        setSelectedInvoices(new Set());
      return;
    }

    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInvoices(newSelected);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "invoiceId",
        header: tc('invoiceId'),
        size: 120,
        Cell: ({ row }) => (
          <Flex align="center" gap={10} style={{ whiteSpace: "nowrap" }}>
            <Checkbox
              checked={selectedInvoices.has(row.original.invoiceId)}
              onChange={() => handleSelect(row.original.invoiceId)}
              size="md"
            />
            <Text fz="md" fw={400} c="rgba(50,51,52,1)">
              {row.original.invoiceId}
            </Text>
          </Flex>
        ),
        Header: ({ column }) => (
            <Flex align="center" gap="xs">
              <Checkbox
                checked={
                  data.length > 0 &&
                  data.every((item) => selectedInvoices.has(item.invoiceId))
                }
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    const allIds = new Set(data.map((item) => item.invoiceId));
                    handleSelect(null, allIds, true);
                  } else {
                    handleSelect(null, new Set(selectedInvoices), false);
                  }
                }}
                size="md"
              />
              <Text c="white" fz="md" fw={500}>
                {tc('invoiceId')}
              </Text>
            </Flex>
          ),
      },
      {
        accessorKey: "barberName",
        header: tc('barberName'),
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
                    {tc('barberName')}
                </Text>
                <Icon color="white" size={14} />
              </Flex>
            );
        },
      },
      {
        accessorKey: "email",
        header: tc('emailAddress'),
        size: 200,
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
        accessorKey: "amount",
        header: tc('amount'),
        size: 120,
        Cell: ({ renderedCellValue }) => (
            <Text fz="md" fw={400} c="rgba(50,51,52,1)">
              ${renderedCellValue.toFixed(2)}
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
                    {tc('amount')}
                </Text>
                <Icon color="white" size={14} />
              </Flex>
            );
        },
      },
      {
        accessorKey: "issueDate",
        header: tc('issueDate'),
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
            if (sortDirection === 'ascending') Icon = FaSortUp;
            if (sortDirection === 'descending') Icon = FaSortDown;
            return (
              <Flex
                align="center"
                gap={5}
                onClick={() => onSort && onSort(column.id)}
                style={{ cursor: 'pointer' }}
              >
                <Text c="white" fz="md" fw={500}>{tc('issueDate')}</Text>
                <Icon color="white" size={14} />
              </Flex>
            )
        },
      },
      {
        id: "actions",
        header: tc('action'),
        size: 150,
        Cell: ({ row }) => (
            <Button
                leftSection={<FaDownload size={16} />}
                onClick={() => onDownload(row.original.invoiceId)}
                className="!bg-[#4679FD] hover:!bg-[#2D62F5]"
                radius="md"
            >
                {tc('download')}
            </Button>
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
                <Text c="white" fz="md" fw={500}>{tc('action')}</Text>
                <Icon color="white" size={14} />
              </Flex>
            )
        },
      },
    ],
    [data, selectedInvoices, sortConfig, onSort, onDownload]
  );

  return (
    <Box>
      <MantineReactTable
        columns={columns}
        data={data}
        enableSorting={false}
        enableColumnActions={false}
        enableTopToolbar={false}
        enableBottomToolbar={false}
        enableRowSelection={false}
        mantineTableContainerProps={{
          style: {
            minWidth: "100%",
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid #E0E0E0",
          },
        }}
        mantineTableHeadProps={{
          style: {
            backgroundColor: "#323334",
          },
        }}
        mantineTableBodyRowProps={{
            style: {
                borderBottom: '1px solid #E0E0E0'
            }
        }}
        mantineTableBodyCellProps={{
            style: {
                padding: '16px',
            }
        }}
        mantineTableHeadCellProps={{
            style: {
                padding: '16px',
            }
        }}
      />
    </Box>
  );
};

export default InvoiceTable;