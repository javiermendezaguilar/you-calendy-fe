import { Modal } from "@mantine/core";
import React, { useEffect, useState } from "react";

const CommonModal = ({ opened, onClose, content, size = "md", styles = {}, closeOnClickOutside = true, closeOnEscape = true, withCloseButton = false }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <Modal
        opened={opened}
        onClose={onClose}
        closeOnClickOutside={closeOnClickOutside}
        closeOnEscape={closeOnEscape}
        radius={isMobile ? 16 : 20}
        centered
        size={isMobile ? "92%" : size}
        styles={{
          root: { 
            "--modal-size": isMobile ? "92%" : undefined,
            ...styles.root
          },
          body: { 
            padding: isMobile ? "12px" : "16px",
            maxHeight: isMobile ? "80vh" : "85vh",
            overflowY: "auto",
            ...styles.body
          },
          inner: { 
            padding: isMobile ? "12px" : "16px",
            overflow: "hidden",
            ...styles.inner
          },
          content: { 
            borderRadius: isMobile ? "16px" : "20px",
            maxWidth: isMobile ? "92%" : undefined,
            margin: "auto",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
            overflow: "hidden",
            ...styles.content
          },
          overlay: {
            opacity: 0.75,
          },
          header: {
            padding: isMobile ? "12px" : "16px",
          },
          close: {
            top: isMobile ? "8px" : "12px",
            right: isMobile ? "8px" : "12px",
          }
        }}
        withCloseButton={withCloseButton}
      >
        {content}
      </Modal>
    </div>
  );
};

export default CommonModal;
