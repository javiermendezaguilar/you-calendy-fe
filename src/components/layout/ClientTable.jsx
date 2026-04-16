import React, { useMemo, useState } from "react";
import {
  Box,
  Text,
  Flex,
  Checkbox,
  Group,
  Button,
  Menu,
  Tooltip,
  Table,
} from "@mantine/core";
import {
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEye,
  FaPaperPlane,
} from "react-icons/fa";
import { ChevronDown } from "tabler-icons-react";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const ButtonWithStatus = ({ client, onStatusUpdate }) => {
  const { tc } = useBatchTranslation();
  const [status, setStatus] = useState(client?.status || "inactive");
  const isDeactivated = status === "deactivated" || status === "inactive";

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
              backgroundColor: "#FA5252",
              display: "flex",
              justifyContent: "space-between",
              padding: "0 8px 0 12px",
            }}
            className="!bg-[#FA5252] hover:!bg-[#E03131]"
          >
            <span>{tc("deactivated")}</span>
            <span
              style={{
                borderLeft: "1px solid #FB7A7A",
                paddingLeft: 6,
                marginLeft: 6,
                display: "flex",
                alignItems: "center",
                height: "100%",
              }}
            >
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
              backgroundColor: "#1478d3",
              display: "flex",
              justifyContent: "space-between",
              padding: "0 8px 0 12px",
            }}
            className="!bg-[#1478d3] hover:!bg-[#0e61b0]"
          >
            <span>{tc("activated")}</span>
            <span
              style={{
                borderLeft: "1px solid #4497e3",
                paddingLeft: 6,
                marginLeft: 6,
                display: "flex",
                alignItems: "center",
                height: "100%",
              }}
            >
              <ChevronDown size={16} />
            </span>
          </Button>
        )}
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={() => handleStatusChange("activated")} disabled={!isDeactivated}>
          {tc("activate")}
        </Menu.Item>
        <Menu.Item onClick={() => handleStatusChange("deactivated")} disabled={isDeactivated}>
          {tc("deactivate")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

const SortableHeader = ({ label, columnId, sortConfig, onSort }) => {
  const isSorted = sortConfig?.key === columnId;
  const sortDirection = isSorted ? sortConfig.direction : null;
  let Icon = FaSort;
  if (sortDirection === "ascending") Icon = FaSortUp;
  if (sortDirection === "descending") Icon = FaSortDown;

  return (
    <Flex
      align="center"
      gap={5}
      onClick={() => onSort && onSort(columnId)}
      style={{ cursor: "pointer" }}
    >
      <Text c="white" fz="md" fw={500}>
        {label}
      </Text>
      <Icon color="white" size={14} />
    </Flex>
  );
};

const ClientTable = ({
  data,
  handleDelete,
  sortConfig,
  onSort,
  onView,
  onStatusUpdate,
  onResendInvitation,
}) => {
  const [selectedClients, setSelectedClients] = useState(new Set());
  const { tc } = useBatchTranslation();

  const allSelected = data.length > 0 && data.every((item) => selectedClients.has(item.id));

  const rows = useMemo(
    () =>
      data.map((client) => {
        const isSelected = selectedClients.has(client.id);
        return (
          <Table.Tr key={client.id} className="!h-[70px]">
            <Table.Td className="!px-4 !py-2 !border-b !border-[#F2F2F2] !whitespace-nowrap">
              <Flex align="center" gap={10}>
                <Checkbox
                  checked={isSelected}
                  onChange={() => {
                    const nextSelected = new Set(selectedClients);
                    if (nextSelected.has(client.id)) {
                      nextSelected.delete(client.id);
                    } else {
                      nextSelected.add(client.id);
                    }
                    setSelectedClients(nextSelected);
                  }}
                  size="md"
                />
                <Text fz="md" fw={400} c="rgba(50,51,52,1)">
                  {client.id.slice(0, 5)}
                </Text>
              </Flex>
            </Table.Td>
            <Table.Td className="!px-4 !py-2 !border-b !border-[#F2F2F2]">
              <Text fz="md" fw={400} c="rgba(50,51,52,1)">
                {client.name}
              </Text>
            </Table.Td>
            <Table.Td className="!px-4 !py-2 !border-b !border-[#F2F2F2]">
              <Text fz="md" fw={400} c="rgba(50,51,52,1)">
                {client.email}
              </Text>
            </Table.Td>
            <Table.Td className="!px-4 !py-2 !border-b !border-[#F2F2F2]">
              <Text fz="md" fw={400} c="rgba(50,51,52,1)">
                {client.phoneNumber}
              </Text>
            </Table.Td>
            <Table.Td className="!px-4 !py-2 !border-b !border-[#F2F2F2]">
              <ButtonWithStatus client={client} onStatusUpdate={onStatusUpdate} />
            </Table.Td>
            <Table.Td className="!px-4 !py-2 !border-b !border-[#F2F2F2]">
              <Group gap="xs">
                <Button
                  variant="filled"
                  c="white"
                  bg="#738B4A"
                  size="xs"
                  onClick={() => onView(client.original)}
                  leftSection={<FaEye size={12} />}
                >
                  {tc("view")}
                </Button>
                <Button
                  color="red"
                  size="xs"
                  onClick={() => handleDelete(client.id)}
                  leftSection={<FaTrash size={12} />}
                >
                  {tc("delete")}
                </Button>
                {!client.isProfileComplete && onResendInvitation ? (
                  <Tooltip label={tc("resendInvitationSMS")}>
                    <Button
                      variant="filled"
                      color="blue"
                      size="xs"
                      onClick={() => onResendInvitation(client.id)}
                      leftSection={<FaPaperPlane size={12} />}
                    >
                      {tc("resend")}
                    </Button>
                  </Tooltip>
                ) : null}
              </Group>
            </Table.Td>
          </Table.Tr>
        );
      }),
    [data, handleDelete, onResendInvitation, onStatusUpdate, onView, selectedClients, tc],
  );

  return (
    <Box className="w-full overflow-x-auto">
      <Table
        highlightOnHover={false}
        withTableBorder={false}
        withColumnBorders={false}
        className="!w-full !min-w-full !table-fixed"
      >
        <Table.Thead className="!bg-[#323334]">
          <Table.Tr>
            <Table.Th className="!p-4 !border-b-0 !whitespace-nowrap" style={{ backgroundColor: "rgba(50, 51, 52, 1)" }}>
              <Flex align="center" gap="xs">
                <Checkbox
                  checked={allSelected}
                  onChange={(e) => {
                    if (e.currentTarget.checked) {
                      setSelectedClients(new Set(data.map((item) => item.id)));
                    } else {
                      setSelectedClients(new Set());
                    }
                  }}
                  size="md"
                />
                <Text c="white" fz="md" fw={500}>
                  {tc("idLabel")}
                </Text>
              </Flex>
            </Table.Th>
            <Table.Th className="!p-4 !border-b-0 !whitespace-nowrap" style={{ backgroundColor: "rgba(50, 51, 52, 1)" }}>
              <SortableHeader label={tc("clientName")} columnId="name" sortConfig={sortConfig} onSort={onSort} />
            </Table.Th>
            <Table.Th className="!p-4 !border-b-0 !whitespace-nowrap" style={{ backgroundColor: "rgba(50, 51, 52, 1)" }}>
              <SortableHeader label={tc("emailAddress")} columnId="email" sortConfig={sortConfig} onSort={onSort} />
            </Table.Th>
            <Table.Th className="!p-4 !border-b-0 !whitespace-nowrap" style={{ backgroundColor: "rgba(50, 51, 52, 1)" }}>
              <SortableHeader label={tc("phoneNumber")} columnId="phoneNumber" sortConfig={sortConfig} onSort={onSort} />
            </Table.Th>
            <Table.Th className="!p-4 !border-b-0 !whitespace-nowrap" style={{ backgroundColor: "rgba(50, 51, 52, 1)" }}>
              <SortableHeader label={tc("status")} columnId="status" sortConfig={sortConfig} onSort={onSort} />
            </Table.Th>
            <Table.Th className="!p-4 !border-b-0 !whitespace-nowrap" style={{ backgroundColor: "rgba(50, 51, 52, 1)" }}>
              <Text c="white" fz="md" fw={500}>
                {tc("actions")}
              </Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Box>
  );
};

export default ClientTable;
