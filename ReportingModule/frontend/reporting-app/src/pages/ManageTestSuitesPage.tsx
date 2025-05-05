//Manage suites page - where admins can create, edit and delete suites

import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import { formatDate } from "../utils/dateTimeUtils";
import Navbar from "../components/Navbar";

interface TestSuite {
  id: number;
  suite_name: string;
  project_id?: number;
  created_at: string;
}

const ManageTestSuitesPage: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [newSuiteName, setNewSuiteName] = useState<string>("");
  const [newProjectId, setNewProjectId] = useState<string>("");

  const [editingSuiteId, setEditingSuiteId] = useState<number | null>(null);
  const [editSuiteName, setEditSuiteName] = useState<string>("");
  const [editProjectId, setEditProjectId] = useState<string>("");

  const fetchTestSuites = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/test-suites/");
      setTestSuites(response.data);
      setError("");
    } catch (err: any) {
      console.error("Error fetching test suites:", err);
      setError("Failed to fetch test suites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestSuites();
  }, []);

  const handleCreateSuite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload: any = { suite_name: newSuiteName };
      if (newProjectId.trim() !== "") {
        payload.project_id = Number(newProjectId);
      }
      await apiClient.post("/create-test-suite/", payload);
      setNewSuiteName("");
      setNewProjectId("");
      fetchTestSuites();
    } catch (err) {
      console.error("Error creating test suite:", err);
      alert("Error creating test suite.");
    }
  };

  const handleDeleteSuite = async (suiteId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this test suite?");
    if (!confirmed) return;
    try {
      await apiClient.delete(`/test-suites/${suiteId}`);
      fetchTestSuites();
    } catch (err) {
      console.error("Error deleting test suite:", err);
      alert("Error deleting test suite.");
    }
  };

  const handleStartEditing = (suite: TestSuite) => {
    setEditingSuiteId(suite.id);
    setEditSuiteName(suite.suite_name);
    setEditProjectId(suite.project_id ? suite.project_id.toString() : "");
  };

  const handleCancelEditing = () => {
    setEditingSuiteId(null);
    setEditSuiteName("");
    setEditProjectId("");
  };

  const handleUpdateSuite = async (suiteId: number) => {
    const confirmed = window.confirm("Are you sure you want to update this test suite?");
    if (!confirmed) return;
    try {
      const payload: any = { suite_name: editSuiteName };
      if (editProjectId.trim() !== "") {
        payload.project_id = Number(editProjectId);
      } else {
        payload.project_id = null;
      }
      await apiClient.patch(`/test-suites/${suiteId}`, payload);
      setEditingSuiteId(null);
      setEditSuiteName("");
      setEditProjectId("");
      fetchTestSuites();
    } catch (err) {
      console.error("Error updating test suite:", err);
      alert("Error updating test suite.");
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Manage Test Suites</h1>

        {/* Create Test Suite Form */}
        <h2 style={styles.subtitle}>Create New Test Suite</h2>
        <form onSubmit={handleCreateSuite} style={styles.form}>
          <input
            type="text"
            placeholder="Suite Name"
            value={newSuiteName}
            onChange={(e) => setNewSuiteName(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Create Suite
          </button>
        </form>

        <h2 style={styles.subtitle}>Existing Test Suites</h2>
        {loading ? (
          <p>Loading test suites...</p>
        ) : error ? (
          <p style={styles.error}>{error}</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.thCell}>ID</th>
                <th style={styles.thCell}>Suite Name</th>
                <th style={styles.thCell}>Project ID</th>
                <th style={styles.thCell}>Created At</th>
                <th style={styles.thCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testSuites.map((suite) => (
                <tr key={suite.id} style={styles.bodyRow}>
                  <td style={styles.tdCell}>{suite.id}</td>
                  <td style={styles.tdCell}>
                    {editingSuiteId === suite.id ? (
                      <input
                        type="text"
                        value={editSuiteName}
                        onChange={(e) => setEditSuiteName(e.target.value)}
                        style={styles.input}
                      />
                    ) : (
                      suite.suite_name
                    )}
                  </td>
                  <td style={styles.tdCell}>
                    {editingSuiteId === suite.id ? (
                      <input
                        type="text"
                        value={editProjectId}
                        onChange={(e) => setEditProjectId(e.target.value)}
                        style={styles.input}
                      />
                    ) : (
                      suite.project_id ?? "None"
                    )}
                  </td>
                  <td style={styles.tdCell}>{formatDate(suite.created_at)}</td>
                  <td style={styles.tdCell}>
                    {editingSuiteId === suite.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateSuite(suite.id)}
                          style={styles.saveButton}
                        >
                          Save
                        </button>
                        <button onClick={handleCancelEditing} style={styles.cancelButton}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEditing(suite)}
                          style={styles.editButton}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSuite(suite.id)}
                          style={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </>
                    )}
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
    maxWidth: "1000px",
  },
  title: {
    textAlign: "center",
    marginBottom: "1rem",
  },
  subtitle: {
    margin: "1.5rem 0 1rem",
  },
  form: {
    marginBottom: "2rem",
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  input: {
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    cursor: "pointer",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#1f2937",
    color: "#fff",
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
  editButton: {
    marginRight: "0.5rem",
    padding: "0.3rem 0.7rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#f0f0f0",
  },
  saveButton: {
    marginRight: "0.5rem",
    padding: "0.3rem 0.7rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#4caf50",
    color: "#fff",
  },
  cancelButton: {
    marginRight: "0.5rem",
    padding: "0.3rem 0.7rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#fff",
    color: "#333",
  },
  deleteButton: {
    padding: "0.3rem 0.7rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "red",
    color: "#fff",
    fontWeight: "bold",
  },
};

export default ManageTestSuitesPage;
