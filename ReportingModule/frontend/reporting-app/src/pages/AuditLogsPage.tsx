//Edit History page - audit log information for certain endpoints (set in the backend) displayed here
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import apiClient from "../services/api";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub: string;
  role: string;
  exp: number;
}

interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  resource_type: string;
  resource_id: number | null;
  details?: any;
  timestamp: string;
}

const AuditLogsPage: React.FC = () => {
  const token = localStorage.getItem("access_token");
  let isAdmin = false;
  if (token) {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      isAdmin = decoded.role.toLowerCase() === "admin";
    } catch (error) {
      console.error("Error decoding token in AuditLogsPage:", error);
    }
  }

  if (!isAdmin) {
    return <div style={styles.notAuthorized}>You are not authorized to view this page.</div>;
  }

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/audit-logs/");
      setLogs(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError("Failed to fetch audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Edit History</h1>
        {loading ? (
          <p>Loading logs...</p>
        ) : error ? (
          <p style={styles.error}>{error}</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.thCell}>Log ID</th>
                <th style={styles.thCell}>User ID</th>
                <th style={styles.thCell}>Action</th>
                <th style={styles.thCell}>Resource Type</th>
                <th style={styles.thCell}>Resource ID</th>
                <th style={styles.thCell}>Details</th>
                <th style={styles.thCell}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={styles.bodyRow}>
                  <td style={styles.tdCell}>{log.id}</td>
                  <td style={styles.tdCell}>{log.user_id ?? "System"}</td>
                  <td style={styles.tdCell}>{log.action}</td>
                  <td style={styles.tdCell}>{log.resource_type}</td>
                  <td style={styles.tdCell}>{log.resource_id ?? "-"}</td>
                  <td style={styles.tdCell}>
                    {log.details ? JSON.stringify(log.details) : "-"}
                  </td>
                  <td style={styles.tdCell}>
                    {new Date(log.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    margin: "2rem auto",
    padding: "1rem",
    maxWidth: "1200px",
  },
  title: {
    textAlign: "center",
    marginBottom: "1rem",
  },
  notAuthorized: {
    margin: "2rem auto",
    padding: "1rem",
    maxWidth: "600px",
    textAlign: "center",
    fontSize: "1.2rem",
    color: "red",
    fontWeight: "bold",
  },
  error: {
    color: "red",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "1rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  headerRow: {
    backgroundColor: "#f8f8f8",
  },
  bodyRow: {
    transition: "background-color 0.2s",
  },
  thCell: {
    padding: "0.75rem",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
  },
  tdCell: {
    padding: "0.75rem",
    borderBottom: "1px solid #ddd",
    verticalAlign: "middle",
  },
};

export default AuditLogsPage;
