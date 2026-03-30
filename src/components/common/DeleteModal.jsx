import React from "react";
import { Button, Flex, Text, Group } from "@mantine/core";
import CommonModal from "./CommonModal";

const DeleteModal = ({
  opened,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmButtonText = "Delete",
  cancelButtonText = "Cancel",
}) => {
  const deleteModalContent = (
    <div>
      <Text fw={600} fz="lg" mb={10} ta="center">
        {title}
      </Text>
      <Text c="dimmed" ta="center" mb={20}>
        {message}
      </Text>
      <Flex gap="md" justify="center" mt={30}>
        <Button
          variant="outline"
          radius="md"
          size="md"
          onClick={onClose}
          styles={{
            root: {
              border: "1px solid #E6E6E6",
              color: "#333",
              minWidth: "120px",
            },
          }}
        >
          {cancelButtonText}
        </Button>
        <Button
          radius="md"
          size="md"
          bg="#FF5252"
          onClick={onConfirm}
          styles={{
            root: {
              minWidth: "120px",
            },
          }}
        >
          {confirmButtonText}
        </Button>
      </Flex>
    </div>
  );

  return (
    <CommonModal
      opened={opened}
      onClose={onClose}
      content={deleteModalContent}
      size="sm"
      styles={{
        content: {
          padding: "24px",
        },
      }}
    />
  );
};

export default DeleteModal;