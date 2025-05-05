// For export functionality

import React, { useState } from "react";
import apiClient from "../services/api";

interface ExportReportModalProps {
  testId: number;
  onClose: () => void;
}

const ExportReportModal: React.FC<ExportReportModalProps> = ({ testId, onClose }) => {
  const [exportFormat, setExportFormat] = useState<string>("pdf"); // Default export option
  const [recipient, setRecipient] = useState<string>("");

  const handleExport = async () => {
    const params: any = {
      format: exportFormat,
      detailed: "true",
      test_id: testId.toString()
    };

    if (exportFormat === "email") {
      if (!recipient.trim()) {
        alert("Please enter a recipient email address.");
        return;
      }
      params.recipient = recipient.trim();
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `${apiClient.defaults.baseURL}/export-report/?${queryString}`;

    if (exportFormat === "email") {
      try {
        const response = await apiClient.get(url);
        if (response.data?.message) {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Error exporting report as email:", error);
        alert("Failed to send email export.");
      }
    } else {
      window.open(url, "_blank");
    }
    onClose();
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h3 style={modalStyles.header}>Export Test Report</h3>
        <div style={modalStyles.field}>
          <label style={modalStyles.label}>
            <input
              type="radio"
              name="exportFormat"
              value="pdf"
              checked={exportFormat === "pdf"}
              onChange={() => setExportFormat("pdf")}
            />
            PDF
          </label>
          <label style={modalStyles.label}>
            <input
              type="radio"
              name="exportFormat"
              value="json"
              checked={exportFormat === "json"}
              onChange={() => setExportFormat("json")}
            />
            JSON
          </label>
          <label style={modalStyles.label}>
            <input
              type="radio"
              name="exportFormat"
              value="email"
              checked={exportFormat === "email"}
              onChange={() => setExportFormat("email")}
            />
            Email
          </label>
        </div>
        {exportFormat === "email" && (
          <div style={modalStyles.field}>
            <label style={modalStyles.label}>
              Recipient Email:
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                style={modalStyles.input}
              />
            </label>
          </div>
        )}
        <div style={modalStyles.buttons}>
          <button onClick={handleExport} style={modalStyles.button}>
            Confirm
          </button>
          <button onClick={onClose} style={modalStyles.button}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const modalStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    width: "300px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.26)",
  },
  header: {
    marginBottom: "1rem",
    textAlign: "center",
  },
  field: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    marginTop: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
  },
  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#1f2937",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default ExportReportModal;
