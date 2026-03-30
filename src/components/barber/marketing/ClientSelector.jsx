import React, { useState, useMemo } from "react";
import { Checkbox, TextInput, ScrollArea, Text, Badge, Group, Button } from "@mantine/core";
import { useGetClients } from "../../../hooks/useClients";
import { useBatchTranslation } from "../../../contexts/BatchTranslationContext";
import { FaSearch } from "react-icons/fa";

const ClientSelector = ({ selectedClientIds, onSelectionChange, filterBy = "all" }) => {
  const { tc } = useBatchTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: clientsData, isLoading } = useGetClients({ limit: 1000 }); // Get all clients

  // Extract clients from API response
  const allClients = useMemo(() => {
    if (!clientsData?.clients) return [];
    
    return clientsData.clients.map(client => ({
      id: client._id,
      firstName: client.firstName || "",
      lastName: client.lastName || "",
      email: client.email ? client.email.toLowerCase() : "", // Normalize email to lowercase for proper display
      phone: client.phone || "",
      name: `${client.firstName || ''} ${client.lastName || ''}`.trim() || tc('unnamedClient'),
    }));
  }, [clientsData, tc]);

  // Filter clients based on filterBy prop
  const filteredClients = useMemo(() => {
    let clients = allClients;
    
    // Filter by email/phone availability based on filterBy
    if (filterBy === "email") {
      clients = clients.filter(c => c.email);
    } else if (filterBy === "phone") {
      clients = clients.filter(c => c.phone);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      clients = clients.filter(
        c =>
          c.name.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.phone?.toLowerCase().includes(query)
      );
    }
    
    return clients;
  }, [allClients, searchQuery, filterBy]);

  const handleToggleClient = (clientId) => {
    const newSelection = [...selectedClientIds];
    const index = newSelection.indexOf(clientId);
    if (index > -1) {
      newSelection.splice(index, 1);
    } else {
      newSelection.push(clientId);
    }
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = filteredClients.map(c => c.id);
    onSelectionChange(allIds);
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  const allSelected = filteredClients.length > 0 && filteredClients.every(c => selectedClientIds.includes(c.id));

  return (
    <div>
      <div className="mb-4">
        <Text size="sm" className="text-slate-600 mb-2">
          {tc('selectClients')} ({selectedClientIds.length} {tc('selected')})
        </Text>
        <div className="flex gap-2 mb-3">
          <TextInput
            placeholder={tc('searchClients')}
            leftSection={<FaSearch size={14} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="filled"
            size="md"
            radius={10}
            className="flex-1"
          />
          <Button
            variant="light"
            size="md"
            onClick={allSelected ? handleDeselectAll : handleSelectAll}
            disabled={filteredClients.length === 0}
          >
            {allSelected ? tc('deselectAll') : tc('selectAll')}
          </Button>
        </div>
      </div>

      <ScrollArea h={300} className="border border-slate-200 rounded-lg p-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Text size="sm" c="dimmed">{tc('loadingClients')}</Text>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex items-center justify-center p-4">
            <Text size="sm" c="dimmed">
              {searchQuery ? tc('noClientsFound') : tc('noClientsAvailable')}
            </Text>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="flex items-center p-2 hover:bg-slate-50 rounded-md cursor-pointer"
                onClick={() => handleToggleClient(client.id)}
              >
                <Checkbox
                  checked={selectedClientIds.includes(client.id)}
                  onChange={() => handleToggleClient(client.id)}
                  onClick={(e) => e.stopPropagation()}
                  size="md"
                  className="mr-3"
                />
                <div className="flex-1">
                  <Group gap="xs">
                    <Text size="sm" fw={500} c="#323334">
                      {client.name}
                    </Text>
                    {/* Show email only for email filter, phone only for phone filter */}
                    {filterBy === "email" && client.email && (
                      <Badge 
                        variant="light" 
                        size="sm" 
                        color="blue"
                        style={{ textTransform: 'none' }}
                      >
                        {client.email}
                      </Badge>
                    )}
                    {filterBy === "phone" && client.phone && (
                      <Badge variant="light" size="sm" color="gray">
                        {client.phone}
                      </Badge>
                    )}
                    {/* Show both if filterBy is "all" */}
                    {filterBy === "all" && (
                      <>
                        {client.email && (
                          <Badge 
                            variant="light" 
                            size="sm" 
                            color="blue"
                            style={{ textTransform: 'none' }}
                          >
                            {client.email}
                          </Badge>
                        )}
                        {client.phone && (
                          <Badge variant="light" size="sm" color="gray">
                            {client.phone}
                          </Badge>
                        )}
                      </>
                    )}
                  </Group>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ClientSelector;

