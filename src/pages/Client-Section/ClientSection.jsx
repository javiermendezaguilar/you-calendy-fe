import React, { useState } from "react";
import {
  Button,
  Progress,
  Text,
  Checkbox,
  TextInput,
  Textarea,
  ScrollArea,
  Group,
  Box,
  Badge,
  Container,
  Paper,
  Flex,
  Divider,
  Loader,
} from "@mantine/core";
import { toast } from "sonner";
import { FaPhone, FaUserPlus, FaPaperPlane, FaSearch } from "react-icons/fa";
import { useGetClientPhones, useSendCustomMessage } from "../../hooks/useClients";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";

const ClientSection = () => {
  const [selectedClientIds, setSelectedClientIds] = useState(new Set());
  const [searchName, setSearchName] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { tc } = useBatchTranslation();
  const { data: clientPhones = [], isLoading: loadingPhones, refetch: refetchPhones } = useGetClientPhones();
  const sendMessage = useSendCustomMessage();

  // Normalize phone number for comparison
  const normalizePhone = (phone) => {
    if (!phone) return "";
    return phone.replace(/\D/g, ""); // Remove all non-digits
  };

  // Check if Contact Picker API is supported
  const isContactPickerSupported = 
    typeof navigator !== "undefined" && 
    "contacts" in navigator && 
    "ContactsManager" in window;

  // Handle selecting contacts from phone
  const handleSelectContacts = async () => {
    if (!isContactPickerSupported) {
      toast.error(tc('contactPickerNotSupported'));
      return;
    }

    try {
      const contacts = await navigator.contacts.select(["name", "tel"], { multiple: true });
      if (!contacts || contacts.length === 0) {
        return;
      }

      let matchedCount = 0;
      let notFoundCount = 0;
      
      for (const contact of contacts) {
        const phones = contact.tel || [];
        
        for (const phoneEntry of phones) {
          const phone = phoneEntry.replace(/\D/g, "");
          if (phone.length < 10) continue;
          
          // Check if client exists
          const existingClient = clientPhones.find(
            (c) => normalizePhone(c.phone) === phone
          );

          if (existingClient) {
            // Client exists, add to selected
            setSelectedClientIds((prev) => new Set([...prev, existingClient.clientId]));
            matchedCount++;
          } else {
            notFoundCount++;
          }
        }
      }

      if (matchedCount > 0) {
        toast.success(tc('selectedClientsFromContacts').replace('{count}', matchedCount));
      }
      if (notFoundCount > 0) {
        toast.warning(tc('contactsNotFoundInList').replace('{count}', notFoundCount));
      }
      
      // Refetch to update UI
      refetchPhones();
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error(tc('failedToAccessContacts'));
        console.error("Contact picker error:", error);
      }
    }
  };

  // Handle searching for client by name - filters the list
  const handleSearchByName = () => {
    const query = searchName.trim().toLowerCase();
    if (!query) {
      setIsSearchActive(false);
      setFilteredClients([]);
      return;
    }

    // Match if any token of the query exists in first name, last name, or email
    const tokens = query.split(/\s+/).filter(Boolean);
    const matches = clientPhones.filter((c) => {
      const first = (c.firstName || "").toLowerCase();
      const last = (c.lastName || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      const full = `${first} ${last}`.trim();
      return tokens.every((t) => 
        first.includes(t) || 
        last.includes(t) || 
        full.includes(t) || 
        email.includes(t)
      );
    });

    if (matches.length > 0) {
      setFilteredClients(matches);
      setIsSearchActive(true);
      toast.success(tc('foundMatchingClients').replace('{count}', matches.length));
    } else {
      setFilteredClients([]);
      setIsSearchActive(true);
      toast.warning(tc('noClientsMatchedName'));
    }
  };

  // Clear search and show all clients
  const handleClearSearch = () => {
    setSearchName("");
    setFilteredClients([]);
    setIsSearchActive(false);
  };

  // Filter clients based on search as user types
  const handleSearchChange = (value) => {
    setSearchName(value);
    
    if (!value.trim()) {
      setFilteredClients([]);
      setIsSearchActive(false);
      return;
    }

    // Auto-filter as user types
    const query = value.trim().toLowerCase();
    const tokens = query.split(/\s+/).filter(Boolean);
    const matches = clientPhones.filter((c) => {
      const first = (c.firstName || "").toLowerCase();
      const last = (c.lastName || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      const full = `${first} ${last}`.trim();
      return tokens.every((t) => 
        first.includes(t) || 
        last.includes(t) || 
        full.includes(t) || 
        email.includes(t)
      );
    });
    
    setFilteredClients(matches);
    setIsSearchActive(true);
  };

  // Toggle client selection
  const handleToggleClient = (clientId) => {
    setSelectedClientIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
        }
      return newSet;
    });
  };

  // Select all existing clients
  const handleSelectAll = () => {
    if (clientPhones.length === 0) return;
    const allIds = new Set(clientPhones.map((c) => c.clientId));
    setSelectedClientIds(allIds);
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedClientIds(new Set());
  };

  // Process and send invitations
  const handleSendInvitations = async () => {
    if (selectedClientIds.size === 0) {
      toast.error(tc('pleaseSelectAtLeastOneClient'));
      return;
    }

    if (!message.trim()) {
      toast.error(tc('pleaseEnterMessage'));
      return;
    }

    setIsProcessing(true);

    try {
      // Send messages to all selected clients
      await sendMessage.mutateAsync({
        clientIds: Array.from(selectedClientIds),
        message: message.trim(),
      });

      // Reset state
      setSelectedClientIds(new Set());
      setSearchName("");
      setFilteredClients([]);
      setIsSearchActive(false);
      refetchPhones();

      toast.success(tc('messagesSentSuccessfully'));
    } catch (error) {
      console.error("Error sending messages:", error);
      toast.error(error?.response?.data?.message || tc('failedToSendMessages'));
    } finally {
      setIsProcessing(false);
    }
  };

  const totalSelected = selectedClientIds.size;

  return (
    <BatchTranslationLoader>
      <Box component="main" className="!h-[83vh] !overflow-auto">
        <Paper radius="lg" sx={{ padding: "24px", margin: "24px" }}>
          <Container size="xl" px={0} sx={{ width: "100%", maxWidth: "100%" }}>
            {/* Header Section */}
            <Flex justify="space-between" align="center" px={24} py={12}>
              <Box>
                <div className="text-2xl">
                  {tc('massInviteClients')}
                </div>
                <Text c="rgba(147,151,153,1)" size="md" mt={2}>
                  {tc('selectExistingClientsDescription')}
                </Text>
              </Box>
            </Flex>

            {/* Action Buttons */}
            <Flex
              gap="md"
              wrap="wrap"
              px={24}
              py={12}
              mt={16}
              align={{ base: "stretch", sm: "center" }}
            >
              {isContactPickerSupported && (
                <Button
                  leftSection={<FaPhone size={14} />}
                  onClick={handleSelectContacts}
                  variant="default"
                  h={50}
                  radius="md"
                  disabled={isProcessing}
                >
                  {tc('selectFromPhoneContacts')}
                </Button>
              )}
              <Button
                leftSection={<FaUserPlus size={14} />}
                onClick={handleSelectAll}
                variant="default"
                h={50}
                radius="md"
                disabled={isProcessing || clientPhones.length === 0}
              >
                {tc('selectAll')} ({clientPhones.length})
              </Button>
              <Button
                onClick={handleDeselectAll}
                variant="subtle"
                h={50}
                radius="md"
                disabled={isProcessing || selectedClientIds.size === 0}
              >
                {tc('deselectAll')}
              </Button>
            </Flex>

            {/* Search Section */}
            <Flex
              justify="space-between"
              align={{ base: "stretch", md: "center" }}
              px={24}
              py={12}
              mt={16}
              direction={{ base: "column", md: "row" }}
              gap="md"
            >
              <TextInput
                placeholder={tc('searchClientByName') + ' or email'}
                leftSection={<FaSearch size={16} />}
                value={searchName}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchByName()}
                w={{ base: "100%", md: 400 }}
                styles={{
                  input: {
                    width: "100%",
                    height: "48px",
                    borderRadius: "8px",
                    paddingLeft: "40px",
                  },
                  leftSection: {
                    marginLeft: "12px",
                  },
                }}
                disabled={isProcessing}
              />
              <Group gap="sm">
                {isSearchActive && (
                  <Button
                    onClick={handleClearSearch}
                    h={48}
                    radius="md"
                    variant="outline"
                    disabled={isProcessing}
                    sx={{
                      minWidth: "100px",
                    }}
                  >
                    {tc('clear')}
                  </Button>
                )}
                <Button
                  onClick={handleSearchByName}
                  h={48}
                  radius="md"
                  disabled={isProcessing}
                  bg="#323334"
                  sx={{
                    minWidth: "120px",
                  }}
                >
                  {tc('search')}
                </Button>
              </Group>
            </Flex>

            {/* Clients Selection Section */}
            <Paper
              radius="md"
              p="lg"
              mt={24}
              mx={24}
              withBorder
              sx={{
                border: "1px solid #E6E6E6",
                backgroundColor: "#FAFAFA",
              }}
            >
              <Flex justify="space-between" align="center" mb="md">
                <Flex gap="sm" align="center">
                  <Text size="lg" fw={600} c="#323334">
                    {tc('selectClients')}
                  </Text>
                  {isSearchActive && (
                    <Badge variant="light" color="gray" size="sm">
                      {filteredClients.length} {filteredClients.length === 1 ? tc('result') : tc('results')}
                    </Badge>
                  )}
                </Flex>
                {totalSelected > 0 && (
                  <Badge size="lg" variant="filled" color="blue">
                    {totalSelected} {tc('selected')}
                  </Badge>
                )}
              </Flex>

              <Divider mb="md" color="#E6E6E6" />

              {loadingPhones ? (
                <Flex justify="center" align="center" py="xl">
                  <Loader size="md" />
                </Flex>
              ) : (isSearchActive ? filteredClients : clientPhones).length === 0 ? (
                <Box py="xl">
                  <Text ta="center" c="dimmed" size="md">
                    {isSearchActive 
                      ? tc('noClientsMatchedSearch')
                      : tc('noClientsFoundAddFirst')}
                  </Text>
                </Box>
              ) : (
                <ScrollArea h={300} type="scroll">
                  <Box px="xs">
                    {(isSearchActive ? filteredClients : clientPhones).map((client, index) => {
                      const displayClients = isSearchActive ? filteredClients : clientPhones;
                      return (
                      <Box key={client.clientId}>
                        <Flex
                          justify="space-between"
                          align="center"
                          py="sm"
                          px="sm"
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "#F5F5F5",
                            },
                            borderRadius: "8px",
                            marginBottom: index < displayClients.length - 1 ? "4px" : 0,
                          }}
                        >
                          <Checkbox
                            checked={selectedClientIds.has(client.clientId)}
                            onChange={() => handleToggleClient(client.clientId)}
                            label={
                              <Group gap="sm" wrap="wrap">
                                <Text size="sm" fw={500} c="#323334">
                                  {client.firstName || client.lastName
                                    ? `${client.firstName || ""} ${client.lastName || ""}`.trim()
                                    : tc('unnamedClient')}
                                </Text>
                                {client.phone && (
                                  <Badge variant="light" size="sm" color="blue">
                                    {client.phone}
                                  </Badge>
                                )}
                                {client.email && (
                                  <Badge 
                                    variant="light" 
                                    size="sm" 
                                    color="green"
                                    style={{ textTransform: 'none' }}
                                  >
                                    {client.email}
                                  </Badge>
                                )}
                              </Group>
                            }
                            size="md"
                          />
                        </Flex>
                        {index < displayClients.length - 1 && (
                          <Divider variant="dashed" color="#E6E6E6" mt="xs" />
                        )}
                      </Box>
                    );
                    })}
                  </Box>
                </ScrollArea>
              )}
            </Paper>

            {/* Message Section */}
            <Paper
              radius="md"
              p="lg"
              mt={24}
              mx={24}
              withBorder
              sx={{
                border: "1px solid #E6E6E6",
                backgroundColor: "#FAFAFA",
              }}
            >
              <Text size="lg" fw={600} c="#323334" mb="md">
                {tc('invitationMessage')}
              </Text>
              <Divider mb="md" color="#E6E6E6" />
              <Textarea
                placeholder={tc('enterInvitationMessage')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                minRows={5}
                disabled={isProcessing}
                styles={{
                  input: {
                    backgroundColor: "white",
                    border: "1px solid #E6E6E6",
                    borderRadius: "8px",
                    fontSize: "14px",
                    padding: "12px",
                  },
                }}
              />
              <Text size="xs" c="dimmed" mt="sm">
                {tc('messageSentViaEmailSMS')}
                 </Text>
            </Paper>

            {/* Progress Indicator */}
            {(isProcessing || sendMessage.isPending) && (
              <Paper 
                radius="md" 
                p="md" 
                mt={24}
                mx={24}
                withBorder
                sx={{
                  border: "1px solid #E6E6E6",
                }}
              >
                <Progress value={100} animated />
                <Text size="sm" c="dimmed" mt="sm" ta="center">
                  {tc('processingMessages')}
                </Text>
              </Paper>
            )}

            {/* Send Button Section */}
            <Flex
              justify="space-between"
              align="center"
              mt={24}
              mb={16}
              px={24}
              py={12}
              direction={{ base: "column", sm: "row" }}
              gap="md"
            >
              <Text size="sm" c="rgba(147,151,153,1)">
                {totalSelected > 0
                  ? `${totalSelected} ${totalSelected > 1 ? tc('clientsSelectedPlural') : tc('clientsSelected')} ${tc('selected')}`
                  : tc('noClientsSelected')}
              </Text>
             <Button
                leftSection={<FaPaperPlane size={14} />}
                onClick={handleSendInvitations}
                disabled={isProcessing || totalSelected === 0 || !message.trim()}
                h={50}
                radius="md"
                bg="#323334"
                size="lg"
                loading={isProcessing || sendMessage.isPending}
                sx={{
                  "&:disabled": {
                    opacity: 0.6,
                    cursor: "not-allowed",
                  },
                }}
             >
                {isProcessing || sendMessage.isPending
                  ? tc('sendingMessages')
                  : `${tc('sendMessages')} (${totalSelected})`}
             </Button>
            </Flex>
          </Container>
        </Paper>
      </Box>
    </BatchTranslationLoader>
  );
};

export default ClientSection;
