//Error metrics page - display the different error types in charts

import React, { useEffect, useState } from "react";
import apiClient from "../services/api";
import Navbar from "../components/Navbar";
import TestSearchBar from "../components/TestSearchBar";
import { useParams, Link } from "react-router-dom";
import { Pie, Bar } from "react-chartjs-2";
import { ChartData } from "chart.js";
import { formatTimestamp } from "../utils/dateTimeUtils";

interface TestSuite {
  id: number;
  suite_name: string;
}

interface ErrorMetricsResponse {
  labels: string[];
  values: number[];
}

interface TestStep {
  step_number: number;
  step_description: string;
  step_status: string;
  error_message?: string;
  timestamp: string;
}

interface TestReport {
  id: number;
  test_name: string;
  status: string;
  execution_time: number;
  timestamp: string;
  steps?: TestStep[];
}

const ErrorMetricsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const [errorData, setErrorData] = useState<ChartData<"pie" | "bar", number[], unknown>>({
    labels: [],
    datasets: [],
  });

  const [suiteOptions, setSuiteOptions] = useState<TestSuite[]>([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState<number | null>(() => {
      const stored = localStorage.getItem("errortypes_selectedSuiteId");
      return stored ? parseInt(stored) : null;
    });
    const [chartType, setChartType] = useState<string>(() => localStorage.getItem("errortypes_chartType") || "pie");

  const [failedTests, setFailedTests] = useState<TestReport[]>([]);

  const truncateErrorMessage = (msg: string): string => {
    if (!msg) return "Unknown Error";
    if (msg.includes("Components used:")) return "";
    if (msg.toLowerCase().startsWith("message:")) {
      msg = msg.substring(8).trim();
    }
    if (msg.toLowerCase().includes("element click intercepted")) {
      return "element click intercepted";
    }
    const words = msg.split(" ");
    return words.slice(0, 3).join(" ");
  };

  useEffect(() => {
    localStorage.setItem("errortypes_selectedSuiteId", selectedSuiteId !== null ? selectedSuiteId.toString() : "");
  }, [selectedSuiteId]);

  useEffect(() => {
    localStorage.setItem("errortypes_chartType", chartType);
  }, [chartType]);

  const fetchTestSuites = async () => {
    if (!projectId) return;
    try {
      const resp = await apiClient.get("/test-suites/", { params: { project_id: projectId } });
      setSuiteOptions(resp.data);
    } catch (err) {
      console.error("Error fetching test suites:", err);
    }
  };

  const fetchErrorMetrics = async () => {
    try {
      const params: any = { project_id: projectId };
      if (selectedSuiteId) {
        params.suite_id = selectedSuiteId;
      }
      const response = await apiClient.get<ErrorMetricsResponse>("/error-types-metrics/", { params });
      setErrorData({
        labels: response.data.labels,
        datasets: [
          {
            label: "Error Types Distribution",
            data: response.data.values,
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching error metrics:", error);
    }
  };

  const fetchFailedTests = async () => {
    if (!projectId) return;
    try {
      const params: any = { project_id: projectId, status: "FAIL" };
      if (selectedSuiteId) {
        params.suite_id = selectedSuiteId;
      }
      const response = await apiClient.get<TestReport[]>("/test-results", { params });
      setFailedTests(response.data);
    } catch (error) {
      console.error("Error fetching failed tests:", error);
    }
  };

  // Get chart options based on chart type selection
  function getChartOptions(chartType: string) {
    if (chartType === "pie") {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "right" as const,
            labels: {
              boxWidth: 20,
              padding: 10,
            },
          },
        },
      };
    } else {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
      };
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchTestSuites();
      fetchErrorMetrics();
      fetchFailedTests();
    }
  }, [projectId, selectedSuiteId]);

  const chartOptions = getChartOptions(chartType);

  return (
    <div>
      <Navbar />
      <div style={styles.searchContainer}>
      <TestSearchBar /> </div>
      <div style={{
        marginTop: "-1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        maxWidth: "1280px",
      }}>
        <h2>Error Types Dashboard (Project ID: {projectId})</h2>
        <div style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem"
        }}>
          <div>
            <label>Filter by Test Suite:</label>
            <select
              value={selectedSuiteId ?? ""}
              onChange={(e) => setSelectedSuiteId(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">All Suites</option>
              {suiteOptions.map((suite) => (
                <option key={suite.id} value={suite.id}>
                  {suite.suite_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Chart Type:</label>
            <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
              <option value="pie">Pie Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
        </div>

        {/* Render error metrics chart */}
        <div style={{
          marginTop: "4rem",
          height: "300px",
          width: "100%",
          marginBottom: "4rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",}}>
            <h4>Error Types {chartType === "pie" ? "Pie Chart" : "Bar Chart"}</h4>
            {chartType === "pie" ? (
              <Pie data={errorData as ChartData<"pie", number[], unknown>} options={chartOptions} />
            ) : (
              <Bar data={errorData as ChartData<"bar", number[], unknown>} options={chartOptions} />
            )}
        </div>

        {/* Table of Failed Tests */}
        <div style={{
          display: "flex",
          marginTop: "2rem",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
           }}>
          <h3>Failed Tests</h3>
          {failedTests.length === 0 ? (
            <p>No failed tests found for {selectedSuiteId ? "this suite" : "this project"}.</p>
          ) : (
            <table style={styles.testTable}>
              <thead>
                <tr>
                  <th style={styles.thCell}>Test Name</th>
                  <th style={styles.thCell}>Error Type</th>
                  <th style={styles.thCell}>Execution Time (s)</th>
                  <th style={styles.thCell}>Started At</th>
                </tr>
              </thead>
              <tbody>
                {failedTests.map((test) => {
                  let errorType = "Unknown";
                  if (test.steps && test.steps.length > 0) {
                    const failingStep = test.steps.find(step => step.step_status.toUpperCase() !== "PASS");
                    if (failingStep && failingStep.error_message) {
                      errorType = truncateErrorMessage(failingStep.error_message);
                    }
                  }
                  return (
                    <tr key={test.id}>
                      <td style={styles.tdCell}>
                        <Link to={`/project/${projectId}/test/${test.id}`}>{test.test_name}</Link>
                      </td>
                      <td style={styles.tdCell}>{errorType}</td>
                      <td style={styles.tdCell}>{test.execution_time}</td>
                      <td style={styles.tdCell}>{formatTimestamp(test.timestamp)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  searchContainer: {
    marginTop: "60px",
    marginLeft: "-22.5rem",
    display: "flex",
    flexDirection: "column" as React.CSSProperties["flexDirection"],
    alignItems: "flex-start" as React.CSSProperties["alignItems"],
  },
  testTable: {
    width: "100%",
    borderCollapse: "collapse" as React.CSSProperties["borderCollapse"],
    margin: "auto",
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

export default ErrorMetricsPage;
