//All Tests page - displays all tests for specfic project matching the filtering options (if any)

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../services/api";
import Navbar from "../components/Navbar";
import { formatTimestamp } from "../utils/dateTimeUtils";
import { getStatusStyle } from "../utils/styleUtils";

interface TestReport {
  id: number;
  test_name: string;
  status: string;
  execution_time: number;
  timestamp: string;
}

interface TestSuite {
  id: number;
  suite_name: string;
}

const AllTestsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tests, setTests] = useState<TestReport[]>([]);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState<number | null>(() => {
    const stored = localStorage.getItem("alltests_selectedSuiteId");
    return stored ? parseInt(stored) : null;
  });
  const [filterStatus, setFilterStatus] = useState<string>(() => localStorage.getItem("alltests_filterStatus") || "");
  const [executionTimeMin, setExecutionTimeMin] = useState<string>(() => localStorage.getItem("alltests_executionTimeMin") || "");
  const [executionTimeMax, setExecutionTimeMax] = useState<string>(() => localStorage.getItem("alltests_executionTimeMax") || "");
  const [sortOption, setSortOption] = useState<string>(() => localStorage.getItem("alltests_sortOption") || "id");
  const [filterTestName, setFilterTestName] = useState<string>(() => localStorage.getItem("alltests_filterTestName") || "");
  const [filterStartDate, setFilterStartDate] = useState<string>(() => localStorage.getItem("alltests_filterStartDate") || "");
  const [filterEndDate, setFilterEndDate] = useState<string>(() => localStorage.getItem("alltests_filterEndDate") || "");

  useEffect(() => {
    localStorage.setItem("alltests_selectedSuiteId", selectedSuiteId !== null ? selectedSuiteId.toString() : "");
  }, [selectedSuiteId]);

  useEffect(() => {
    localStorage.setItem("alltests_filterStatus", filterStatus);
  }, [filterStatus]);

  useEffect(() => {
    localStorage.setItem("alltests_executionTimeMin", executionTimeMin);
  }, [executionTimeMin]);

  useEffect(() => {
    localStorage.setItem("alltests_executionTimeMax", executionTimeMax);
  }, [executionTimeMax]);

  useEffect(() => {
    localStorage.setItem("alltests_sortOption", sortOption);
  }, [sortOption]);

  useEffect(() => {
    localStorage.setItem("alltests_filterTestName", filterTestName);
  }, [filterTestName]);

  useEffect(() => {
    localStorage.setItem("alltests_filterStartDate", filterStartDate);
  }, [filterStartDate]);

  useEffect(() => {
    localStorage.setItem("alltests_filterEndDate", filterEndDate);
  }, [filterEndDate]);

  const fetchTestSuites = async () => {
    if (!projectId) return;
    try {
      const resp = await apiClient.get("/test-suites", { params: { project_id: projectId } });
      setSuites(resp.data);
    } catch (err) {
      console.error("Error fetching test suites:", err);
    }
  };

  const loadData = async () => {
    if (!projectId) return;
    try {
      const params: any = {
        project_id: projectId,
        suite_id: selectedSuiteId,
        status: filterStatus,
        test_name: filterTestName,
        start_date: filterStartDate,
        end_date: filterEndDate,
        min_execution_time: executionTimeMin,
        max_execution_time: executionTimeMax,
        sort_by: sortOption,
      };
      Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      const testResultsResp = await apiClient.get("/test-results", { params });
      setTests(testResultsResp.data);
    } catch (error) {
      console.error("Error loading test data:", error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTestSuites();
      loadData();
    }
  }, [projectId, selectedSuiteId, filterStatus, executionTimeMin, executionTimeMax, sortOption, filterTestName, filterStartDate, filterEndDate]);

  return (
    <div>
      <Navbar />
      <div style={styles.pageContainer}>
        <h2 style={styles.title}>All Tests (Project ID: {projectId})</h2>
        {suites.length > 0 && (
          <div style={styles.filterContainer}>
            <label style={styles.filterLabel}>Select Test Suite:</label>
            <select
              value={selectedSuiteId ?? ""}
              onChange={(e) => setSelectedSuiteId(e.target.value ? parseInt(e.target.value) : null)}
              style={styles.selectInput}
            >
              <option value="">All Suites</option>
              {suites.map(s => (
                <option key={s.id} value={s.id}>{s.suite_name}</option>
              ))}
            </select>
          </div>
        )}
        <div style={styles.filterSortContainer}>
          <div style={styles.filterGroup}>
            <label>Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label>Test Name:</label>
            <input
              type="text"
              value={filterTestName}
              onChange={(e) => setFilterTestName(e.target.value)}
              placeholder="Search by Test Name"
            />
          </div>
          <div style={styles.filterGroup}>
            <label>Start Date:</label>
            <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
          </div>
          <div style={styles.filterGroup}>
            <label>End Date:</label>
            <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
          </div>
          <div style={styles.filterGroup}>
            <label>Min Exec Time (s):</label>
            <input type="number" value={executionTimeMin} onChange={(e) => setExecutionTimeMin(e.target.value)} />
          </div>
          <div style={styles.filterGroup}>
            <label>Max Exec Time (s):</label>
            <input type="number" value={executionTimeMax} onChange={(e) => setExecutionTimeMax(e.target.value)} />
          </div>
          <div style={styles.filterGroup}>
            <label>Sort By:</label>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="id">Test ID</option>
              <option value="test_name">Test Name</option>
              <option value="execution_time">Execution Time</option>
              <option value="most_recent">Most Recent Execution</option>
            </select>
          </div>
          <button onClick={loadData} style={styles.filterButton}>Apply</button>
        </div>
        {tests.length === 0 ? (
          <p>No tests found for this project (or suite).</p>
        ) : (
          <table style={styles.testTable}>
            <thead>
              <tr>
                <th style={styles.thCell}>Test Name</th>
                <th style={styles.thCell}>Status</th>
                <th style={styles.thCell}>Execution Time (s)</th>
                <th style={styles.thCell}>Started At</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id}>
                  <td style={styles.tdCell}>
                    <Link to={`/project/${projectId}/test/${test.id}`}>{test.test_name}</Link>
                  </td>
                  <td style={{ ...styles.tdCell, ...getStatusStyle(test.status) }}>{test.status}</td>
                  <td style={styles.tdCell}>{test.execution_time}</td>
                  <td style={styles.tdCell}>{formatTimestamp(test.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    marginTop: "90px",
    minHeight: "calc(100vh - 80px)",
    padding: "1rem",
    display: "flex",
    flexDirection: "column" as React.CSSProperties["flexDirection"],
    alignItems: "center" as React.CSSProperties["alignItems"],
    textAlign: "center" as React.CSSProperties["textAlign"],
    maxWidth: "1280px",
  },
  title: {
    marginBottom: "0.5rem",
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  filterLabel: {
    fontWeight: 500,
  },
  selectInput: {
    padding: "0.3rem 0.5rem",
  },
  filterSortContainer: {
    display: "flex",
    flexWrap: "wrap" as React.CSSProperties["flexWrap"],
    gap: "1rem",
    justifyContent: "center" as React.CSSProperties["justifyContent"],
    marginBottom: "1rem",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column" as React.CSSProperties["flexDirection"],
    alignItems: "flex-start" as React.CSSProperties["alignItems"],
  },
  filterButton: {
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#36A2EB",
    color: "#fff",
    cursor: "pointer",
    alignSelf: "center",
  },
  testTable: {
    width: "100%",
    borderCollapse: "collapse" as React.CSSProperties["borderCollapse"],
    margin: "0 auto",
  },
  thCell: {
    border: "1px solid #ccc",
    padding: "0.5rem",
    backgroundColor: "#f0f0f0",
    textAlign: "center" as React.CSSProperties["textAlign"],
  },
  tdCell: {
    border: "1px solid #ccc",
    padding: "0.5rem",
    textAlign: "center" as React.CSSProperties["textAlign"],
  },
};

export default AllTestsPage;
