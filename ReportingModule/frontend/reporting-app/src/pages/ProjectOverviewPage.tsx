// Main project page which displays several customisable charts

import React, { useEffect, useState } from "react";
import { useParams} from "react-router-dom";
import apiClient from "../services/api";
import Navbar from "../components/Navbar";
import TestSearchBar from "../components/TestSearchBar";
import { Pie, Bar, Line } from "react-chartjs-2";
import { formatDate } from "../utils/dateTimeUtils";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ChartData
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

interface TestReport {
  id: number;
  test_name: string;
  status: string;
  execution_time: number;
  timestamp: string;
}

interface AggregatedReport {
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  pass_rate: number;
  avg_execution_time: number;
}

interface TestSuite {
  id: number;
  suite_name: string;
}

const ProjectOverviewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tests, setTests] = useState<TestReport[]>([]);
  const [aggregated, setAggregated] = useState<AggregatedReport | null>(null);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState<number | null>(() => {
    const stored = localStorage.getItem("selectedSuiteId");
    return stored ? parseInt(stored) : null;
  });

  const [pieData, setPieData] = useState<ChartData<"pie", number[], unknown>>({
    labels: [],
    datasets: [],
  });
  const [pieMetric, setPieMetric] = useState<string>(() => localStorage.getItem("pieMetric") || "pass_fail");
  const [barMetric, setBarMetric] = useState<string>(() => localStorage.getItem("barMetric") || "last_10");
  const [lineMetric, setLineMetric] = useState<string>(() => localStorage.getItem("lineMetric") || "pass_rate");

  useEffect(() => {
    localStorage.setItem("selectedSuiteId", selectedSuiteId ? selectedSuiteId.toString() : "");
  }, [selectedSuiteId]);

  useEffect(() => {
    localStorage.setItem("pieMetric", pieMetric);
  }, [pieMetric]);

  useEffect(() => {
    localStorage.setItem("barMetric", barMetric);
  }, [barMetric]);

  useEffect(() => {
    localStorage.setItem("lineMetric", lineMetric);
  }, [lineMetric]);

  const [barChartData, setBarChartData] = useState<ChartData<"bar", number[], unknown>>({
    labels: [],
    datasets: [],
  });
  const [lineChartData, setLineChartData] = useState<ChartData<"line", number[], unknown>>({
    labels: [],
    datasets: [],
  });

  const fetchTestSuites = async () => {
    if (!projectId) return;
    try {
      const resp = await apiClient.get("/test-suites", {
        params: { project_id: projectId },
      });
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
      };
      Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      const testResultsResp = await apiClient.get("/test-results", { params });
      setTests(testResultsResp.data);
      const aggregatedResp = await apiClient.get("/aggregated-reports", {
        params: {
          project_id: projectId,
          suite_id: selectedSuiteId,
        },
      });
      setAggregated(aggregatedResp.data);
    } catch (error) {
      console.error("Error loading project data:", error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTestSuites();
      loadData();
    }
  }, [projectId, selectedSuiteId]);

  // Pie chart data generator based on selected metric
  const getPieChartData = async (): Promise<ChartData<"pie", number[], unknown>> => {
    if (pieMetric === "pass_fail") {
      if (!aggregated) {
        return { labels: [], datasets: [] };
      }
      const passCount = aggregated.passed_tests ?? 0;
      const failCount = aggregated.failed_tests ?? 0;
      return {
        labels: ["Pass", "Fail"],
        datasets: [
          {
            label: "Pass/Fail Distribution",
            data: [passCount, failCount],
            backgroundColor: ["#36A2EB", "#FF6384"],
          },
        ],
      };
    } else if (pieMetric === "suite_distribution") {
      try {
        const response = await apiClient.get("/aggregated-by-suite", {
          params: { project_id: projectId },
        });
        const suiteData = response.data;
        const labels = suiteData.map((s: any) => s.suite_name);
        const data = suiteData.map((s: any) => s.total_tests);
        return {
          labels,
          datasets: [
            {
              label: "Test Suite Distribution",
              data,
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
            },
          ],
        };
      } catch (error) {
        console.error("Error fetching suite aggregation:", error);
        return { labels: [], datasets: [] };
      }
    }
    return { labels: [], datasets: [] };
  };

  useEffect(() => {
    const updatePieData = async () => {
      const data = await getPieChartData();
      setPieData(data);
    };
    updatePieData();
  }, [pieMetric, aggregated, projectId]);

  // Bar chart data generator based on selected metric
  const getBarChartData = () => {
    if (barMetric === "last_10") {
      const sortedTests = tests.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const lastTen = sortedTests.slice(0, 10).reverse();
      const labels = lastTen.map(t => t.test_name);
      const data = lastTen.map(t => t.execution_time);
      return {
        labels,
        datasets: [{
          label: "Execution Time (s)",
          data,
          backgroundColor: "#4BC0C0",
        }],
      };
    } else if (barMetric === "top_slowest") {
      const sortedTests = tests.slice().sort((a, b) => b.execution_time - a.execution_time);
      const topTen = sortedTests.slice(0, 10);
      const labels = topTen.map(t => t.test_name);
      const data = topTen.map(t => t.execution_time);
      return {
        labels,
        datasets: [{
          label: "Top 10 Slowest Tests (s)",
          data,
          backgroundColor: "#FF6384",
        }],
      };
    } else if (barMetric === "top_fastest") {
      const sortedTests = tests.slice().sort((a, b) => a.execution_time - b.execution_time);
      const topTen = sortedTests.slice(0, 10);
      const labels = topTen.map(t => t.test_name);
      const data = topTen.map(t => t.execution_time);
      return {
        labels,
        datasets: [{
          label: "Top 10 Fastest Tests (s)",
          data,
          backgroundColor: "#36A2EB",
        }],
      };
    }
    return { labels: [], datasets: [] };
  };

  useEffect(() => {
    const data = getBarChartData();
    setBarChartData(data);
  }, [barMetric, tests]);

  // Line chart data generator based on selected metric
  const getLineChartData = async (): Promise<ChartData<"line", number[], unknown>> => {
    const sortedTests = tests.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    if (lineMetric === "pass_rate") {
      const trendData = sortedTests.map((t, index) => {
        const passCount = sortedTests.slice(0, index + 1).filter(test => test.status.toUpperCase() === "PASS").length;
        return { date: t.timestamp.split("T")[0], passRate: (passCount / (index + 1)) * 100 };
      });
      return {
        labels: trendData.map(d => d.date),
        datasets: [{
          label: "Pass Rate Over Time (%)",
          data: trendData.map(d => d.passRate),
          fill: false,
          borderColor: "#FF9F40",
        }],
      };
    } else if (lineMetric === "avg_exec_time") {
      const trendData = sortedTests.map((t, index) => {
        const avgTime = sortedTests.slice(0, index + 1)
          .reduce((sum, test) => sum + test.execution_time, 0) / (index + 1);
        return { date: t.timestamp.split("T")[0], avgExecTime: avgTime };
      });
      return {
        labels: trendData.map(d => d.date),
        datasets: [{
          label: "Average Execution Time Over Time (s)",
          data: trendData.map(d => d.avgExecTime),
          fill: false,
          borderColor: "#36A2EB",
        }],
      };
    } else if (lineMetric === "test_count") {
      const trendData = sortedTests.map((t, index) => ({
        date: t.timestamp.split("T")[0],
        count: index + 1
      }));
      return {
        labels: trendData.map(d => d.date),
        datasets: [{
          label: "Cumulative Test Count",
          data: trendData.map(d => d.count),
          fill: false,
          borderColor: "#9966FF",
        }],
      };
    } else if (lineMetric === "tests_per_day") {
      try {
        const response = await apiClient.get("/tests-per-day", { params: { project_id: projectId, suite_id: selectedSuiteId } });
        const data = response.data;
        return {
          labels: data.map((d: any) => formatDate(d.date)),
          datasets: [{
            label: "Tests Executed Per Day",
            data: data.map((d: any) => d.count),
            fill: false,
            borderColor: "#4BC0C0",
          }],
        };
      } catch (error) {
        console.error("Error fetching tests per day data:", error);
        return { labels: [], datasets: [] };
      }
    } else if (lineMetric === "tests_per_week") {
      try {
        const response = await apiClient.get("/tests-per-week", { params: { project_id: projectId, suite_id: selectedSuiteId } });
        const data = response.data;
        return {
          labels: data.map((d: any) => formatDate(d.week)),
          datasets: [{
            label: "Tests Executed Per Week",
            data: data.map((d: any) => d.count),
            fill: false,
            borderColor: "#FF9F40",
          }],
        };
      } catch (error) {
        console.error("Error fetching tests per week data:", error);
        return { labels: [], datasets: [] };
      }
    }
    return { labels: [], datasets: [] };
  };

  useEffect(() => {
    const updateLineData = async () => {
      const data = await getLineChartData();
      setLineChartData(data);
    };
    updateLineData();
  }, [lineMetric, tests]);

  return (
    <div>
      <Navbar />
      <div style={styles.searchContainer}>
      <TestSearchBar /> </div>
      <div style={styles.pageContainer}>
        <div style={styles.headerSection}>
          <h2 style={styles.title}>Project Details (Project ID: {projectId})</h2>
          {suites.length > 0 && (
            <div style={styles.filterContainer}>
              <label style={styles.filterLabel}>Select Test Suite:</label>
              <select
                value={selectedSuiteId ?? ""}
                onChange={(e) => setSelectedSuiteId(e.target.value ? parseInt(e.target.value) : null)}
                style={styles.selectInput}
              >
                <option value="">All Suites</option>
                {suites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.suite_name}
                  </option>
                ))}
              </select>
            </div>
          )}

            <div style={styles.chartControlsContainer}>
              <div style={styles.chartControl}>
                <label>Pie Chart Metric:</label>
                <select value={pieMetric} onChange={(e) => setPieMetric(e.target.value)} style={styles.selectInput}>
                <option value="pass_fail">Pass/Fail Distribution</option>
                <option value="suite_distribution">Suite Distribution</option>
                </select>
              </div>
              <div style={styles.chartControl}>
                <label>Bar Chart Metric:</label>
                <select value={barMetric} onChange={(e) => setBarMetric(e.target.value)} style={styles.selectInput}>
                  <option value="last_10">Last 10 Tests</option>
                  <option value="top_slowest">Top 10 Slowest</option>
                  <option value="top_fastest">Top 10 Fastest</option>
                </select>
              </div>
              <div style={styles.chartControl}>
                <label>Line Chart Metric:</label>
                <select value={lineMetric} onChange={(e) => setLineMetric(e.target.value)} style={styles.selectInput}>
                  <option value="pass_rate">Pass Rate Trend</option>
                  <option value="avg_exec_time">Average Exec Time Trend</option>
                  <option value="test_count">Cumulative Test Count</option>
                  <option value="tests_per_day">Tests per Day</option>
                  <option value="tests_per_week">Tests per Week</option>
                </select>
              </div>
            </div>

            {aggregated && (
          <div style={styles.aggregatedSection}>
            <p>Total Tests: {aggregated.total_tests}</p>
            <p>Passed Tests: {aggregated.passed_tests}</p>
            <p>Failed Tests: {aggregated.failed_tests}</p>
            <p>Pass Rate: {aggregated.pass_rate.toFixed(1)}%</p>
            <p>Average Exec Time: {aggregated.avg_execution_time.toFixed(2)}s</p>
          </div>
        )}
            <div style={styles.chartsRow}>
              <div style={styles.chartWrapper}>
                <h4>{pieMetric === "pass_fail"
                  ? "Pass/Fail"
                  : "Suite Distribution"}
                </h4>
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <div style={styles.chartWrapper}>
                <h4>{barMetric === "last_10"
                    ? "Last 10 Tests Execution Times"
                    : barMetric === "top_slowest"
                    ? "Top 10 Slowest Tests"
                    : "Top 10 Fastest Tests"}
                </h4>
                <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <div style={styles.chartWrapper}>
              <h4>
                  {lineMetric === "pass_rate"
                    ? "Pass Rate Trend"
                    : lineMetric === "avg_exec_time"
                    ? "Average Execution Time Trend"
                    : lineMetric === "test_count"
                    ? "Cumulative Test Count"
                    : lineMetric === "tests_per_day"
                    ? "Tests Executed Per Day"
                    : "Tests Executed Per Week"}
                </h4>
                <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    marginTop: "90px",
    minHeight: "calc(100vh - 80px)",
    display: "flex",
    flexDirection: "column" as React.CSSProperties["flexDirection"],
    alignItems: "center" as React.CSSProperties["alignItems"],
    textAlign: "center" as React.CSSProperties["textAlign"],
    maxWidth: "1280px"
  },
  searchContainer: {
      marginTop: "60px",
      marginLeft: "-20rem",
      display: "flex",
      flexDirection: "column" as React.CSSProperties["flexDirection"],
      alignItems: "flex-start" as React.CSSProperties["alignItems"],
    },
  headerSection: {
    width: "100%",
    maxWidth: "900px",
    display: "flex",
    flexDirection: "column" as React.CSSProperties["flexDirection"],
    alignItems: "center" as React.CSSProperties["alignItems"],
    marginBottom: "1rem",
  },
  title: {
    marginTop: "-5rem",
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
  chartControlsContainer: {
    display: "flex",
    flexWrap: "wrap" as React.CSSProperties["flexWrap"],
    gap: "1rem",
    justifyContent: "center" as React.CSSProperties["justifyContent"],
    marginTop: "1rem",
    marginBottom: "1rem",
  },
  chartControl: {
    display: "flex",
    flexDirection: "column" as React.CSSProperties["flexDirection"],
    alignItems: "center" as React.CSSProperties["alignItems"],
  },
  aggregatedSection: {
    marginBottom: "1rem",
  },
  chartsRow: {
    display: "flex",
    gap: "2rem",
    justifyContent: "center" as React.CSSProperties["justifyContent"],
    marginBottom: "2rem",
  },
  chartWrapper: {
    flex: "1 1 auto",
    minWidth: "300px",
    maxWidth: "400px",
    maxHeight: "300px",
  },
};

export default ProjectOverviewPage;
